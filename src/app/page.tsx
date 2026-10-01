import { ColinhaActions } from "@/components/actions/ColinhaActions";
import { CandidateList } from "@/components/colinha/CandidateList";
import { ColinhaFooter } from "@/components/colinha/ColinhaFooter";
import { ColinhaHeader } from "@/components/colinha/ColinhaHeader";
import { ColinhaWrapper } from "@/components/colinha/ColinhaWrapper";
import { IntroPanel } from "@/components/layout/IntroPanel";
import { ColinhaProvider } from "@/context/ColinhaContext";

export default function Home() {
  return (
    <ColinhaProvider>
      <main className="min-h-dvh lg:grid lg:grid-cols-[minmax(0,28rem)_auto] lg:content-center lg:justify-center lg:gap-x-16 lg:gap-y-8 lg:px-10 lg:py-12">
        {/* Celular: a colinha ocupa a largura toda. Tablet/desktop: cartão com até 480 px. */}
        <div className="colinha-stage w-full sm:mx-auto sm:max-w-[480px] sm:pt-8 lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:w-[clamp(360px,calc((100dvh-6rem)*0.5625),460px)] lg:max-w-none lg:pt-0">
          <div className="overflow-hidden sm:rounded-[2rem] sm:shadow-2xl sm:ring-1 sm:shadow-black/40 sm:ring-white/10">
            <ColinhaWrapper>
              <ColinhaHeader />
              <CandidateList />
              <ColinhaFooter />
            </ColinhaWrapper>
          </div>
        </div>
        <IntroPanel />
        <ColinhaActions />
      </main>
    </ColinhaProvider>
  );
}
