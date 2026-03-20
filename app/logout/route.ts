import { NextResponse } from "next/server";

function clearSessionCookies(response: NextResponse) {
  response.cookies.set("fluenverse_admin_auth", "", { path: "/", maxAge: 0 });
  response.cookies.set("fluenverse_admin_user", "", { path: "/", maxAge: 0 });
  response.cookies.set("fluenverse_user_role", "", { path: "/", maxAge: 0 });
  response.cookies.set("fluenverse_user_initials", "", { path: "/", maxAge: 0 });
}

export async function POST(request: Request) {
  const response = NextResponse.redirect(new URL("/login", request.url));
  clearSessionCookies(response);
  return response;
}

export async function GET(request: Request) {
  return NextResponse.redirect(new URL("/admin", request.url));
}

export async function DELETE(request: Request) {
  const response = NextResponse.redirect(new URL("/login", request.url));
  clearSessionCookies(response);
  return response;
}
