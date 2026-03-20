export async function ensureEmployeeSignatureTable(
  env: Pick<CloudflareBindings, "DB">,
) {
  await env.DB.exec(`
    CREATE TABLE IF NOT EXISTS employee_signatures (
      id text PRIMARY KEY NOT NULL,
      employee_id text NOT NULL,
      signature_data text NOT NULL,
      passcode_salt text,
      passcode_hash text,
      created_at text NOT NULL,
      updated_at text NOT NULL,
      FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE cascade
    );
    CREATE UNIQUE INDEX IF NOT EXISTS employee_signatures_employee_id_unique
      ON employee_signatures (employee_id);
    CREATE INDEX IF NOT EXISTS employee_signatures_employee_id_idx
      ON employee_signatures (employee_id);
  `);
}

export async function ensureEmployerSignatureTable(
  env: Pick<CloudflareBindings, "DB">,
) {
  await env.DB.exec(`
    CREATE TABLE IF NOT EXISTS employer_signatures (
      id text PRIMARY KEY NOT NULL,
      user_id text NOT NULL,
      signature_data text NOT NULL,
      passcode_salt text,
      passcode_hash text,
      created_at text NOT NULL,
      updated_at text NOT NULL
    );
    CREATE UNIQUE INDEX IF NOT EXISTS employer_signatures_user_id_unique
      ON employer_signatures (user_id);
    CREATE INDEX IF NOT EXISTS employer_signatures_user_id_idx
      ON employer_signatures (user_id);
  `);
}
