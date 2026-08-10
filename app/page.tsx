import Link from "next/link";

const examples = [
  {
    href: "/examples/expandable-rows",
    title: "Expandable rows",
  },
  {
    href: "/examples/lazy-expandable-rows",
    title: "Lazy expandable rows",
  },
];

const Home = () => {
  return (
    <main className="min-h-screen bg-white p-10">
      <nav aria-label="AG Grid 예제 목록">
        <ul className="m-0 list-none p-0">
          {examples.map((example) => (
            <li key={example.href}>
              <Link
                className="text-blue-600 underline underline-offset-4"
                href={example.href}
              >
                {example.title}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </main>
  );
};

export default Home;
