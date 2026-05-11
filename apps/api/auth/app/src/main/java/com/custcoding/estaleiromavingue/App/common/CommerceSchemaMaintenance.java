package com.custcoding.estaleiromavingue.App.common;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class CommerceSchemaMaintenance implements ApplicationRunner {

    private final JdbcTemplate jdbcTemplate;

    @Override
    public void run(ApplicationArguments args) {
        ensureLegacyPurchaseSchema();
        ensureLegacySaleSchema();
    }

    private void ensureLegacyPurchaseSchema() {
        try {
            jdbcTemplate.execute("alter table if exists factura_compra add column if not exists forma_pagamento varchar(40)");
            jdbcTemplate.execute("alter table if exists factura_compra add column if not exists valor_pago numeric(18,2)");
            jdbcTemplate.execute("alter table if exists factura_compra add column if not exists troco numeric(18,2)");

            jdbcTemplate.execute("""
                    update factura_compra
                    set forma_pagamento = coalesce(forma_pagamento, 'DINHEIRO_FISICO')
                    where forma_pagamento is null
                    """);
            jdbcTemplate.execute("""
                    update factura_compra
                    set valor_pago = coalesce(valor_pago, total, coalesce(preco_unit, 0) * coalesce(quantidade, 0))
                    where valor_pago is null
                    """);
            jdbcTemplate.execute("""
                    update factura_compra
                    set troco = coalesce(troco, coalesce(valor_pago, 0) - coalesce(total, 0))
                    where troco is null
                    """);

            jdbcTemplate.execute("alter table if exists factura_compra alter column forma_pagamento set default 'DINHEIRO_FISICO'");
            jdbcTemplate.execute("alter table if exists factura_compra alter column forma_pagamento set not null");

            jdbcTemplate.execute("""
                    create table if not exists factura_compra_item (
                        id bigserial primary key,
                        id_factura_compra bigint not null references factura_compra(id) on delete cascade,
                        id_produto bigint not null references table_product(id),
                        quantidade integer not null,
                        preco_unitario numeric(18,2) not null,
                        subtotal numeric(18,2) not null
                    )
                    """);

            log.info("Schema de compras verificado com sucesso.");
        } catch (Exception ex) {
            log.warn("Nao foi possivel rever o schema legado de compras: {}", ex.getMessage());
        }
    }

    private void ensureLegacySaleSchema() {
        try {
            jdbcTemplate.execute("alter table if exists venda add column if not exists forma_pagamento varchar(40)");
            jdbcTemplate.execute("alter table if exists venda add column if not exists estado_levantamento varchar(40)");
            jdbcTemplate.execute("alter table if exists venda add column if not exists levantamento_notas varchar(500)");
            jdbcTemplate.execute("alter table if exists venda add column if not exists valor_pago numeric(18,2)");
            jdbcTemplate.execute("alter table if exists venda add column if not exists troco numeric(18,2)");
            jdbcTemplate.execute("alter table if exists venda add column if not exists atualizado_em timestamp with time zone");
            jdbcTemplate.execute("alter table if exists venda add column if not exists levantado_em timestamp with time zone");

            jdbcTemplate.execute("""
                    update venda
                    set forma_pagamento = coalesce(forma_pagamento, 'DINHEIRO_FISICO')
                    where forma_pagamento is null
                    """);
            jdbcTemplate.execute("""
                    update venda
                    set estado_levantamento = coalesce(estado_levantamento, 'AGUARDANDO_PREPARACAO')
                    where estado_levantamento is null
                    """);
            jdbcTemplate.execute("""
                    update venda
                    set atualizado_em = coalesce(atualizado_em, criado_em, now())
                    where atualizado_em is null
                    """);
            jdbcTemplate.execute("""
                    update venda
                    set valor_pago = coalesce(valor_pago, total, 0)
                    where valor_pago is null
                    """);
            jdbcTemplate.execute("""
                    update venda
                    set troco = coalesce(troco, coalesce(valor_pago, 0) - coalesce(total, 0))
                    where troco is null
                    """);

            jdbcTemplate.execute("alter table if exists venda alter column forma_pagamento set default 'DINHEIRO_FISICO'");
            jdbcTemplate.execute("alter table if exists venda alter column forma_pagamento set not null");
            jdbcTemplate.execute("alter table if exists venda alter column estado_levantamento set default 'AGUARDANDO_PREPARACAO'");

            jdbcTemplate.execute("""
                    create table if not exists item_venda (
                        id bigserial primary key,
                        id_venda bigint not null references venda(id) on delete cascade,
                        id_produto bigint not null references table_product(id),
                        quantidade integer not null,
                        preco_unitario numeric(18,2) not null,
                        subtotal numeric(18,2) not null
                    )
                    """);

            log.info("Schema de vendas verificado com sucesso.");
        } catch (Exception ex) {
            log.warn("Nao foi possivel rever o schema legado de vendas: {}", ex.getMessage());
        }
    }
}
