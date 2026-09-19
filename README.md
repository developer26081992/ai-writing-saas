# AI Writing SaaS

An AI-powered collaborative writing application built with Next.js, Tiptap, Yjs, Hocuspocus, Prisma, Neon PostgreSQL, OpenAI, and Stripe.

## Features

- Rich text editing using **Tiptap**
- Real-time collaborative document editing using **Yjs and Hocuspocus**
- AI writing assistant with streaming responses
- OpenAI integration using the **Vercel AI SDK**
- AI generation token usage tracking
- Subscription-based plan limits
- FREE, PRO, and ENTERPRISE plans
- Document creation limits
- Stripe subscription billing
- Stripe webhook integration for subscription synchronisation
- PostgreSQL database using Prisma and Neon

## Technology Stack

- **Next.js**
- **React**
- **TypeScript**
- **Tiptap**
- **Yjs**
- **Hocuspocus**
- **Prisma**
- **Neon PostgreSQL**
- **OpenAI**
- **Vercel AI SDK**
- **Stripe**
- **Tailwind CSS**

## Getting Started

First, install the dependencies:

```bash
npm install

```

Create a `.env.local` file and configure the required environment variables.

Then start the Next.js development server:

```bash
npm run dev

```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Start the Collaboration Server

The real-time collaboration server runs separately using Hocuspocus.

In another terminal, run:

```bash
npm run collaboration

```

The collaboration server runs on port `1234`.

## Plan Limits


| Plan       | AI Generations | Documents |
| ---------- | -------------- | --------- |
| FREE       | 10/month       | 5         |
| PRO        | 500/month      | Unlimited |
| ENTERPRISE | Unlimited      | Unlimited |


Plan limits are enforced on the server using Next.js Server Actions.

## AI Writing Assistant

The AI writing assistant allows users to enter a writing prompt and receive a streamed AI response.

AI generation usage is tracked, including:

- Input tokens
- Output tokens
- Total tokens
- AI model used
- Prompt
- Generated completion
- Generation date

## Stripe Billing

The application supports subscription billing through Stripe.

Supported subscription functionality includes:

- Creating subscriptions
- PRO and ENTERPRISE plans
- Checkout sessions
- Subscription events
- Subscription status synchronisation
- Subscription cancellation handling
- Webhook processing

Stripe webhook events are used to keep the application's subscription and organisation plan information synchronised.

## Database

The application uses **PostgreSQL** with **Prisma ORM**.

The database stores:

- Users
- Organisations
- Memberships
- Documents
- AI generations
- Usage metrics
- Subscriptions

To synchronise the database schema:

```bash
npx prisma db push

```

To open Prisma Studio:

```bash
npx prisma studio

```

## Build

To create a production build:

```bash
npm run build

```

To start the production application:

```bash
npm run start

```

## AI Coding Assistants Usage

AI coding assistants were used during the development of this project to support software development, debugging, code explanation, troubleshooting, and documentation.

The following AI coding assistants were used:

- **GitHub Copilot** – assisted with code completion, code suggestions, and development tasks.
- **Cursor** – assisted with code generation, debugging, project navigation, and implementation of application features.
- **Claude** – used for code assistance, problem solving, and reviewing implementation approaches.
- **ChatGPT** – used for code generation, debugging, technical explanations, troubleshooting, and guidance during development.

All AI-generated suggestions were reviewed, tested, and adapted as necessary by the developer. The developer remains responsible for the final implementation, configuration, testing, and functionality of the application.

## Deployment

The application can be deployed using the **Vercel Platform**.

Before deployment, configure the required environment variables in the Vercel project settings.

## License

This project was developed as part of an academic software development assignment.