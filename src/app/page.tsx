import { Nav } from "@/components/nav";
import { Hero } from "@/components/hero";
import { SocialProof } from "@/components/social-proof";
import { ProblemSolution } from "@/components/problem-solution";
import { Features } from "@/components/features";
import { Showcase } from "@/components/showcase";
import { ClientView } from "@/components/client-view";
import { Workflow } from "@/components/workflow";
import { Testimonials } from "@/components/testimonials";
import { Pricing } from "@/components/pricing";
import { FAQ } from "@/components/faq";
import { FinalCTA } from "@/components/final-cta";
import { Footer } from "@/components/footer";

export default function Home() {
  return (
    <div
      style={{
        maxWidth: "100vw",
        overflowX: "hidden",
        background:
          "radial-gradient(1200px 600px at 75% -8%, var(--pf-accent-soft), transparent 60%), #fff",
      }}
    >
      <Nav />
      <Hero />
      <SocialProof />
      <ProblemSolution />
      <Features />
      <Showcase />
      <ClientView />
      <Workflow />
      <Testimonials />
      <Pricing />
      <FAQ />
      <FinalCTA />
      <Footer />
    </div>
  );
}
