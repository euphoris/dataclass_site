import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import { QuizResultVisualizer } from "@/components/QuizStat";
import Layout from '@theme/Layout';

export default function Page() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <Layout
      title={`Hello from ${siteConfig.title}`}
      description="Description will go into a meta tag in <head />">
      <main>
        <QuizResultVisualizer />
      </main>
    </Layout>
  );
}
