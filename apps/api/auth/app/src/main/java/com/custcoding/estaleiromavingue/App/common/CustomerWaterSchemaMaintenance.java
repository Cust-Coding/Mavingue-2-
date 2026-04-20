package com.custcoding.estaleiromavingue.App.common;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class CustomerWaterSchemaMaintenance implements ApplicationRunner {

    private final JdbcTemplate jdbcTemplate;

    @Override
    public void run(ApplicationArguments args) {
        dropLegacyUniqueEmailRules();
    }

    private void dropLegacyUniqueEmailRules() {
        try {
            List<String> constraints = jdbcTemplate.queryForList("""
                    select con.conname
                    from pg_constraint con
                    join pg_class rel on rel.oid = con.conrelid
                    where rel.relname = 'customer_water'
                      and con.contype = 'u'
                      and exists (
                        select 1
                        from unnest(con.conkey) as key(attnum)
                        join pg_attribute att on att.attrelid = rel.oid and att.attnum = key.attnum
                        where att.attname = 'email'
                      )
                    """, String.class);

            for (String constraint : constraints) {
                jdbcTemplate.execute("alter table customer_water drop constraint if exists " + quoteIdentifier(constraint));
                log.info("Constraint unique removida de customer_water.email: {}", constraint);
            }

            List<String> indexes = jdbcTemplate.queryForList("""
                    select indexname
                    from pg_indexes
                    where schemaname = current_schema()
                      and tablename = 'customer_water'
                      and indexdef like 'CREATE UNIQUE INDEX%'
                      and indexdef like '%(email)%'
                    """, String.class);

            for (String index : indexes) {
                jdbcTemplate.execute("drop index if exists " + quoteIdentifier(index));
                log.info("Indice unique removido de customer_water.email: {}", index);
            }
        } catch (Exception ex) {
            log.warn("Nao foi possivel rever as regras antigas de unicidade em customer_water.email: {}", ex.getMessage());
        }
    }

    private String quoteIdentifier(String name) {
        return "\"" + name.replace("\"", "\"\"") + "\"";
    }
}
