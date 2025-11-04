import { Toaster } from "./components/ui/sonner";
import MainLayout from "./layout/MainLayout";
import { StepperWithLabel } from "@/components/Stepper";

function App() {
    return (
        <MainLayout>
            <Toaster />
            <StepperWithLabel />
        </MainLayout>
    );
}

export default App;
