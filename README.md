## Project: Realtime Collaborative Whiteboard with AI predictions

### Preview:

- todo

### Steps to host locally:

1. Setup `.env` file:
```env
GITHUB_APP_CLIENT_ID=""
GITHUB_APP_CLIENT_SECRET=""
NEXTAUTH_SECRET=""
NEXTAUTH_URL="http://localhost:3000"
WEBSOCKET_URL="ws://localhost:1234"
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
POSTGRES_URL=""
```

2. Add redirect URIs for Oauth2 providers:
- Google: `http://localhost:3000/api/auth/callback/google`
- Github: `http://localhost:3000/api/auth/callback/github`

3. Configure prisma:

```bash
npx prisma generate
npx prisma db push
```

4. Install dependencies:

```bash
npm i
```

5. Run the websocket server:

```bash
mkdir -p persistense-whiteboard-data
HOST=localhost PORT=1234 YPERSISTENSE=./persistense-whiteboard-data npx y-websocket
```

6. Run the NextJS app:

```bash
npm run dev
```
