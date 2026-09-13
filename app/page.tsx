import Image from "next/image";

export default function Home() {
  const envTest = process.env.ENV_TEST;
  return (
    <>
      <h1>{envTest}</h1>
    </>
  );
}
