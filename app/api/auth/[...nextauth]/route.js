
import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"

export const authOptions = {
  providers: [
    // GoogleProvider : Google을 인증 제공자로 사용하도록 설정 
    // .env.local에 정의한 클라이언트 ID, 시크릿을 사용 
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      // Google에 요청할 권한 범위를 지정
      // openid email profiel - 사용자 정보 (이메일, 이름, 프로필 사진)
      authorization: {
        params: {
          scope: "openid email profile https://www.googleapis.com/auth/drive.file",
        },
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,

  // JWT 토큰이 생성되거나 세션이 확인될 때 실행되는 함수 
  // jwt : 구글 로그인시 받은 access_token을 JWT에 포함 
  // 해당 토큰이 있어야 Google Drive API를 호출 가능함 

  // session : 클라이언트에서 사용 가능하도록 세션 객체에 accessToken을 추가 
  
  callbacks: {
    async jwt({ token, account }) {
      if (account?.access_token) {
        token.accessToken = account.access_token;
      }
      return token;
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken;
      return session;
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
