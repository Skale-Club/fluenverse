const SUPABASE_STUDENTS_SELECT = "*";
const SUPABASE_USERS_SELECT = "*";

type SupabaseFetchResult = {
  data: unknown[] | null;
  error: string;
  status: number;
};

async function fetchTableFromSupabase(
  tableName: "students" | "users",
  selectValue: string
): Promise<SupabaseFetchResult> {
  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    return {
      data: null as unknown[] | null,
      error: "Configure SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY no ambiente.",
      status: 500,
    };
  }

  const restUrl = new URL(`${supabaseUrl.replace(/\/$/, "")}/rest/v1/${tableName}`);
  restUrl.searchParams.set("select", selectValue);
  restUrl.searchParams.set("order", "created_at.desc");

  const response = await fetch(restUrl.toString(), {
    method: "GET",
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const details = await response.text();
    return {
      data: null as unknown[] | null,
      error: `Falha ao ler tabela ${tableName}: ${response.status} ${details}`,
      status: response.status,
    };
  }

  const data = (await response.json()) as unknown[];
  return { data, error: "", status: response.status };
}

function isTableMissingError(errorText: string): boolean {
  return errorText.includes("PGRST205") || errorText.includes("Could not find the table");
}

export async function fetchStudentsFromSupabase() {
  const studentsResult = await fetchTableFromSupabase("students", SUPABASE_STUDENTS_SELECT);
  if (!studentsResult.error) {
    return { data: studentsResult.data, error: "" };
  }

  // If students table does not exist yet, keep UI stable with an empty list.
  if (studentsResult.status === 404 && isTableMissingError(studentsResult.error)) {
    return { data: [] as unknown[], error: "" };
  }

  return { data: null as unknown[] | null, error: "Nao foi possivel carregar alunos no Supabase." };
}

export async function fetchUsersFromSupabase() {
  const usersResult = await fetchTableFromSupabase("users", SUPABASE_USERS_SELECT);
  if (usersResult.error) {
    return {
      data: null as unknown[] | null,
      error: usersResult.status === 500 ? usersResult.error : "Nao foi possivel carregar usuarios no Supabase.",
    };
  }
  return { data: usersResult.data, error: "" };
}
