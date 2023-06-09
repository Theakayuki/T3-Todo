import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { type NextPage } from "next";
import { signIn, signOut, useSession } from "next-auth/react";
import Head from "next/head";
import { useState } from "react";
import { ZodError } from "zod";
import Button from "~/components/Button";
import { todoInput } from "~/types";
import { api, type RouterOutputs } from "~/utils/api";

type Todo = RouterOutputs["todo"]["getAll"][number];

dayjs.extend(relativeTime);

const Home: NextPage = () => {
  const { data: sessionData } = useSession();

  return (
    <>
      <Head>
        <title>Todo Tracker T3</title>
        <meta
          name="description"
          content="A Todo Application, Created with the T3 Stack, Styled with TailwindCss using NextJS, using Postgres database with prisma and TRPC."
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="bg-gradient-to-b from-amber-300 via-rose-600 to-rose-800 dark:from-slate-800 dark:via-slate-950 dark:to-black">
        <div className="mx-auto flex min-h-screen max-w-2xl flex-col content-center justify-center pt-8">
          {!sessionData?.user && <MainPage />}
          <AuthShowcase />
          {sessionData?.user && <TodosView />}
        </div>
      </main>
    </>
  );
};

export default Home;

const TodosView: React.FC = () => {
  const { data: todos } = api.todo.getAll.useQuery();

  return (
    <>
      <TodoForm />
      {todos?.map((todo) => (
        <TodoView key={todo.id} {...todo} />
      ))}
    </>
  );
};

const MainPage: React.FC = () => {
  return (
    <>
      <h1 className="mb-4 text-center text-5xl font-bold text-white">
        T3 Todo App
      </h1>
      <p className="text-center text-lg text-white">
        This is a fullstack todo app built with Next.js, React, Tailwind,
        Prisma, and TRPC.
      </p>
      <p className="mb-4 text-center text-white">
        Please sign in to start creating todos
      </p>
    </>
  );
};

const AuthShowcase: React.FC = () => {
  const { data: sessionData } = useSession();

  return (
    <div className="flex flex-col items-center justify-center px-4 md:mx-12 md:flex-row">
      <p className="mb-4 text-center text-2xl text-orange-950 dark:text-slate-300 md:mb-0">
        {sessionData && <span>Logged in as {sessionData.user?.name}</span>}
      </p>
      <Button
        onClick={sessionData ? () => void signOut() : () => void signIn()}
      >
        {sessionData ? "Sign out" : "Sign in"}
      </Button>
    </div>
  );
};

const TodoForm: React.FC = () => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [error, setError] = useState<string>();
  const trpc = api.useContext();
  const { mutateAsync: createTodo } = api.todo.createPost.useMutation({
    onSettled: async () => {
      await trpc.todo.getAll.invalidate();
    },
  });

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      const todo = { title, content };
      todoInput.parse(todo);
      await createTodo(todo);
      setTitle("");
      setContent("");
      setError(undefined);
    } catch (error) {
      if (error instanceof ZodError) {
        setError(error.issues[0]?.message);
      }
    }
  };

  return (
    <form
      onSubmit={(event) => void handleSubmit(event)}
      className="mx-12 my-8 flex flex-col justify-center space-y-4"
    >
      <input
        className="w-full rounded-md border border-white/20 px-4 py-2"
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <textarea
        className="w-full rounded-md border border-white/20 px-4 py-2"
        placeholder="Content"
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />
      {error && <div className="text-red-500">{error}</div>}
      <Button
        className="bg-amber-200 transition hover:animate-bounce hover:bg-amber-100"
        type="submit"
      >
        Create
      </Button>
    </form>
  );
};

const TodoView: React.FC<Todo> = (todo) => {
  const trpc = api.useContext();
  const { mutate: deleteTodo } = api.todo.deletePost.useMutation({
    onSettled: async () => {
      await trpc.todo.getAll.invalidate();
    },
  });
  const { mutate: toggle } = api.todo.toggleCompleted.useMutation({
    onSettled: async () => {
      await trpc.todo.getAll.invalidate();
    },
  });
  const { title, content, createdAt } = todo;

  const handleDelete = () => {
    deleteTodo(todo.id);
  };

  const handleToggle = () => {
    toggle({ id: todo.id, completed: !todo.completed });
  };

  return (
    <div className="relative m-8 rounded-md border border-white bg-white/75 p-4 text-center">
      <div>
        <div className="flex">
          <input
            type="checkbox"
            name="completed"
            id="completed"
            checked={todo.completed}
            onChange={handleToggle}
            className="mr-1 rounded-full bg-green-700 px-9 py-2 text-base font-semibold text-white no-underline transition hover:bg-green-600"
          />
          <label
            htmlFor="completed"
            className={`${
              todo.completed ? "text-green-600" : "text-transparent"
            }`}
          >
            Completed
          </label>
        </div>

        <h2 className="text-lg font-bold">{title}</h2>

        <button
          onClick={handleDelete}
          className="absolute right-2 top-2 text-lg"
        >
          ❌
        </button>
      </div>
      <hr className="my-3 border-black" />
      <div className="flex flex-col text-left md:justify-between">
        <p className="text-left">{content}</p>
        <p className="text-right">Created: {dayjs().to(createdAt)}</p>
      </div>
    </div>
  );
};
