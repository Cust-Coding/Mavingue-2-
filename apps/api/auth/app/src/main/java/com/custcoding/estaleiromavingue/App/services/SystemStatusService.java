package com.custcoding.estaleiromavingue.App.services;

import com.custcoding.estaleiromavingue.App.dtos.system_status.SystemStatusMetricResponseDTO;
import com.custcoding.estaleiromavingue.App.dtos.system_status.SystemStatusResponseDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.lang.management.ManagementFactory;
import java.lang.management.RuntimeMXBean;
import java.net.InetSocketAddress;
import java.net.Socket;
import java.nio.file.FileStore;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class SystemStatusService {

    private final JdbcTemplate jdbcTemplate;

    public SystemStatusResponseDTO current() {
        LocalDateTime now = LocalDateTime.now();
        List<SystemStatusMetricResponseDTO> metricas = List.of(
                databaseMetric(now),
                broadbandMetric(now),
                cpuMetric(now),
                memoryMetric(now),
                diskMetric(now),
                uptimeMetric(now)
        );

        int percentagemGeral = metricas.stream()
                .mapToInt(SystemStatusMetricResponseDTO::percentagem)
                .sum();
        percentagemGeral = metricas.isEmpty() ? 0 : clamp(Math.round((float) percentagemGeral / metricas.size()));

        long azuis = metricas.stream().filter(metric -> "blue".equals(metric.tom())).count();
        long amarelos = metricas.stream().filter(metric -> "yellow".equals(metric.tom())).count();
        long vermelhos = metricas.stream().filter(metric -> "red".equals(metric.tom())).count();

        return new SystemStatusResponseDTO(
                percentagemGeral,
                statusByScore(percentagemGeral),
                toneByScore(percentagemGeral),
                azuis + " area(s) estaveis, " + amarelos + " em atencao e " + vermelhos + " critica(s).",
                now,
                metricas
        );
    }

    private SystemStatusMetricResponseDTO databaseMetric(LocalDateTime now) {
        long startedAt = System.nanoTime();
        try {
            jdbcTemplate.queryForObject("select 1", Integer.class);
            long durationMs = elapsedMillis(startedAt);
            int score = latencyScore(durationMs, 60, 120, 250, 500);
            return metric(
                    "database",
                    "Base de dados",
                    score,
                    rangedState(score, "Operacional", "Resposta lenta", "Indisponivel"),
                    "Consulta SQL concluida em " + durationMs + " ms.",
                    "Ligacao de leitura verificada directamente na BD.",
                    now
            );
        } catch (Exception ex) {
            return metric(
                    "database",
                    "Base de dados",
                    5,
                    "Indisponivel",
                    "Falha ao validar a base de dados.",
                    safeMessage(ex),
                    now
            );
        }
    }

    private SystemStatusMetricResponseDTO broadbandMetric(LocalDateTime now) {
        ConnectivityResult result = measureConnectivity();
        if (!result.connected()) {
            return metric(
                    "broadband",
                    "Banda larga",
                    8,
                    "Sem ligacao",
                    "Nao foi possivel sair para a internet neste momento.",
                    result.message(),
                    now
            );
        }

        int score = latencyScore(result.latencyMs(), 90, 160, 320, 700);
        return metric(
                "broadband",
                "Banda larga",
                score,
                rangedState(score, "Ligacao forte", "Ligacao instavel", "Ligacao fraca"),
                "Saida externa em " + result.latencyMs() + " ms.",
                "Teste feito para " + result.target() + ".",
                now
        );
    }

    private SystemStatusMetricResponseDTO cpuMetric(LocalDateTime now) {
        java.lang.management.OperatingSystemMXBean bean = ManagementFactory.getOperatingSystemMXBean();
        int processors = Math.max(bean.getAvailableProcessors(), 1);

        if (bean instanceof com.sun.management.OperatingSystemMXBean osBean) {
            double cpuLoad = osBean.getCpuLoad();
            if (!Double.isNaN(cpuLoad) && cpuLoad >= 0) {
                int used = clamp((int) Math.round(cpuLoad * 100));
                int score = clamp(100 - used);
                return metric(
                        "cpu",
                        "CPU do servidor",
                        score,
                        rangedState(score, "Carga leve", "Carga moderada", "Carga alta"),
                        "Uso actual estimado em " + used + "%.",
                        processors + " nucleo(s) logico(s) em observacao.",
                        now
                );
            }
        }

        double loadAverage = bean.getSystemLoadAverage();
        if (!Double.isNaN(loadAverage) && loadAverage >= 0) {
            int used = clamp((int) Math.round((loadAverage / processors) * 100));
            int score = clamp(100 - used);
            return metric(
                    "cpu",
                    "CPU do servidor",
                    score,
                    rangedState(score, "Carga leve", "Carga moderada", "Carga alta"),
                    "Carga media por nucleo em " + used + "%.",
                    "Leitura obtida pelo sistema operativo.",
                    now
            );
        }

        return metric(
                "cpu",
                "CPU do servidor",
                50,
                "Monitoria parcial",
                "Nao foi possivel ler a carga exacta da CPU.",
                processors + " nucleo(s) detectado(s) no servidor.",
                now
        );
    }

    private SystemStatusMetricResponseDTO memoryMetric(LocalDateTime now) {
        Runtime runtime = Runtime.getRuntime();
        long max = runtime.maxMemory();
        long used = runtime.totalMemory() - runtime.freeMemory();
        long freeCapacity = Math.max(max - used, 0L);
        int score = max <= 0 ? 0 : clamp((int) Math.round((freeCapacity * 100.0) / max));

        return metric(
                "memory",
                "Memoria disponivel",
                score,
                rangedState(score, "Folga boa", "Memoria em atencao", "Memoria critica"),
                "Livre " + formatBytes(freeCapacity) + " de " + formatBytes(max) + ".",
                "Uso actual da JVM em " + clamp((int) Math.round((used * 100.0) / Math.max(max, 1L))) + "%.",
                now
        );
    }

    private SystemStatusMetricResponseDTO diskMetric(LocalDateTime now) {
        try {
            Path workspace = Path.of(System.getProperty("user.dir")).toAbsolutePath();
            FileStore store = Files.getFileStore(workspace);
            long total = store.getTotalSpace();
            long free = store.getUsableSpace();
            int score = total <= 0 ? 0 : clamp((int) Math.round((free * 100.0) / total));

            return metric(
                    "disk",
                    "Disco livre",
                    score,
                    rangedState(score, "Espaco confortavel", "Espaco em atencao", "Espaco critico"),
                    "Livre " + formatBytes(free) + " de " + formatBytes(total) + ".",
                    "Volume monitorado: " + store.name(),
                    now
            );
        } catch (IOException ex) {
            return metric(
                    "disk",
                    "Disco livre",
                    15,
                    "Sem leitura",
                    "Nao foi possivel medir o espaco em disco.",
                    safeMessage(ex),
                    now
            );
        }
    }

    private SystemStatusMetricResponseDTO uptimeMetric(LocalDateTime now) {
        RuntimeMXBean runtimeMXBean = ManagementFactory.getRuntimeMXBean();
        long uptimeMs = runtimeMXBean.getUptime();
        int score;
        if (uptimeMs >= 24L * 60L * 60L * 1000L) {
            score = 100;
        } else if (uptimeMs >= 6L * 60L * 60L * 1000L) {
            score = 92;
        } else if (uptimeMs >= 60L * 60L * 1000L) {
            score = 84;
        } else if (uptimeMs >= 15L * 60L * 1000L) {
            score = 68;
        } else {
            score = 52;
        }

        return metric(
                "uptime",
                "Tempo activo",
                score,
                rangedState(score, "Servico estavel", "Reinicio recente", "Arranque recente"),
                "Servidor activo ha " + formatDuration(uptimeMs) + ".",
                "Nome da JVM: " + runtimeMXBean.getVmName(),
                now
        );
    }

    private ConnectivityResult measureConnectivity() {
        List<String> errors = new ArrayList<>();
        List<ConnectivityTarget> targets = List.of(
                new ConnectivityTarget("1.1.1.1", 53),
                new ConnectivityTarget("8.8.8.8", 53),
                new ConnectivityTarget("example.com", 443)
        );

        for (ConnectivityTarget target : targets) {
            long startedAt = System.nanoTime();
            try (Socket socket = new Socket()) {
                socket.connect(new InetSocketAddress(target.host(), target.port()), 1500);
                return new ConnectivityResult(
                        true,
                        elapsedMillis(startedAt),
                        target.host() + ":" + target.port(),
                        "Ligacao externa valida."
                );
            } catch (IOException ex) {
                errors.add(target.host() + ":" + target.port() + " - " + safeMessage(ex));
            }
        }

        return new ConnectivityResult(false, 0L, "-", String.join(" | ", errors));
    }

    private SystemStatusMetricResponseDTO metric(
            String id,
            String titulo,
            int percentagem,
            String estado,
            String detalhe,
            String observacao,
            LocalDateTime actualizadoEm
    ) {
        int normalized = clamp(percentagem);
        return new SystemStatusMetricResponseDTO(
                id,
                titulo,
                estado,
                toneByScore(normalized),
                normalized,
                detalhe,
                observacao,
                actualizadoEm
        );
    }

    private String toneByScore(int score) {
        if (score >= 75) {
            return "blue";
        }
        if (score >= 45) {
            return "yellow";
        }
        return "red";
    }

    private String statusByScore(int score) {
        if (score >= 75) {
            return "Estavel";
        }
        if (score >= 45) {
            return "Atencao";
        }
        return "Critico";
    }

    private String rangedState(int score, String blueState, String yellowState, String redState) {
        if (score >= 75) {
            return blueState;
        }
        if (score >= 45) {
            return yellowState;
        }
        return redState;
    }

    private int latencyScore(long latencyMs, long fastThreshold, long goodThreshold, long warningThreshold, long slowThreshold) {
        if (latencyMs <= fastThreshold) {
            return 100;
        }
        if (latencyMs <= goodThreshold) {
            return 88;
        }
        if (latencyMs <= warningThreshold) {
            return 70;
        }
        if (latencyMs <= slowThreshold) {
            return 52;
        }
        return 25;
    }

    private long elapsedMillis(long startedAt) {
        return Math.max(1L, Math.round((System.nanoTime() - startedAt) / 1_000_000.0));
    }

    private String formatBytes(long bytes) {
        double gb = bytes / (1024.0 * 1024.0 * 1024.0);
        if (gb >= 1) {
            return String.format(java.util.Locale.ROOT, "%.1f GB", gb);
        }

        double mb = bytes / (1024.0 * 1024.0);
        return String.format(java.util.Locale.ROOT, "%.0f MB", mb);
    }

    private String formatDuration(long durationMs) {
        long totalMinutes = durationMs / 60_000L;
        long days = totalMinutes / (24L * 60L);
        long hours = (totalMinutes % (24L * 60L)) / 60L;
        long minutes = totalMinutes % 60L;

        if (days > 0) {
            return days + " dia(s) e " + hours + " h";
        }
        if (hours > 0) {
            return hours + " h e " + minutes + " min";
        }
        return minutes + " min";
    }

    private int clamp(int value) {
        return Math.max(0, Math.min(100, value));
    }

    private String safeMessage(Exception ex) {
        String message = ex.getMessage();
        if (message == null || message.isBlank()) {
            return ex.getClass().getSimpleName();
        }
        return message;
    }

    private record ConnectivityTarget(String host, int port) {
    }

    private record ConnectivityResult(boolean connected, long latencyMs, String target, String message) {
    }
}
