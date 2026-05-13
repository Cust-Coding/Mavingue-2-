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
        ensureOperationalProductSchema();
        ensureClientAccountSchema();
        ensureUserPermissionSchema();
        ensureLegacyPurchaseSchema();
        ensureLegacySaleSchema();
    }

    private void ensureOperationalProductSchema() {
        try {
            jdbcTemplate.execute("alter table if exists table_product add column if not exists ativo boolean");
            jdbcTemplate.execute("alter table if exists table_product add column if not exists apagado_em timestamp");
            jdbcTemplate.execute("update table_product set ativo = true where ativo is null");
            jdbcTemplate.execute("alter table if exists table_product alter column ativo set default true");
            jdbcTemplate.execute("alter table if exists table_product alter column ativo set not null");
            log.info("Schema operacional de produtos verificado com sucesso.");
        } catch (Exception ex) {
            log.warn("Nao foi possivel rever o schema operacional de produtos: {}", ex.getMessage());
        }
    }

    private void ensureClientAccountSchema() {
        try {
            jdbcTemplate.execute("alter table if exists app_user add column if not exists desativada_pelo_cliente boolean");
            jdbcTemplate.execute("alter table if exists app_user add column if not exists desativada_pelo_cliente_em timestamp");
            jdbcTemplate.execute("update app_user set desativada_pelo_cliente = false where desativada_pelo_cliente is null");
            jdbcTemplate.execute("alter table if exists app_user alter column desativada_pelo_cliente set default false");
            jdbcTemplate.execute("alter table if exists app_user alter column desativada_pelo_cliente set not null");
            log.info("Schema de estados da conta do cliente verificado com sucesso.");
        } catch (Exception ex) {
            log.warn("Nao foi possivel rever o schema de estados da conta do cliente: {}", ex.getMessage());
        }
    }

    private void ensureUserPermissionSchema() {
        try {
            jdbcTemplate.execute("""
                    create table if not exists app_user_permissions (
                        app_user_id bigint not null references app_user(id) on delete cascade,
                        permission_key varchar(80) not null
                    )
                    """);

            var invalidConstraints = jdbcTemplate.queryForList("""
                    select con.conname
                    from pg_constraint con
                    join pg_class rel on rel.oid = con.conrelid
                    where rel.relname = 'app_user_permissions'
                      and con.contype = 'u'
                      and exists (
                        select 1
                        from unnest(con.conkey) as key(attnum)
                        join pg_attribute att on att.attrelid = rel.oid and att.attnum = key.attnum
                        where att.attname = 'permission_key'
                      )
                      and not exists (
                        select 1
                        from unnest(con.conkey) as key(attnum)
                        join pg_attribute att on att.attrelid = rel.oid and att.attnum = key.attnum
                        where att.attname = 'app_user_id'
                      )
                    """, String.class);

            for (String constraint : invalidConstraints) {
                jdbcTemplate.execute("alter table app_user_permissions drop constraint if exists " + quoteIdentifier(constraint));
                log.info("Constraint antiga removida de app_user_permissions.permission_key: {}", constraint);
            }

            var invalidIndexes = jdbcTemplate.queryForList("""
                    select indexname
                    from pg_indexes
                    where schemaname = current_schema()
                      and tablename = 'app_user_permissions'
                      and indexdef like 'CREATE UNIQUE INDEX%'
                      and indexdef like '%(permission_key)%'
                      and indexdef not like '%app_user_id%'
                    """, String.class);

            for (String index : invalidIndexes) {
                jdbcTemplate.execute("drop index if exists " + quoteIdentifier(index));
                log.info("Indice unique antigo removido de app_user_permissions.permission_key: {}", index);
            }

            jdbcTemplate.execute("""
                    create unique index if not exists ux_app_user_permissions_user_permission
                    on app_user_permissions(app_user_id, permission_key)
                    """);
            log.info("Schema de permissoes dos utilizadores verificado com sucesso.");
        } catch (Exception ex) {
            log.warn("Nao foi possivel rever o schema de permissoes dos utilizadores: {}", ex.getMessage());
        }
    }

    private String quoteIdentifier(String name) {
        return "\"" + name.replace("\"", "\"\"") + "\"";
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
