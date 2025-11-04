import React from "react";
import { Scanner } from "@yudiel/react-qr-scanner";
import { toast } from "sonner";

interface IBoundingBox {
    x: number;
    y: number;
    width: number;
    height: number;
}

interface IPoint {
    x: number;
    y: number;
}

interface IDetectedBarcode {
    boundingBox: IBoundingBox;
    cornerPoints: IPoint[];
    format: string;
    rawValue: string;
}

export type QrScannerProps = {
    onResult?: (text: string) => void;
};

export default function QrScanner({ onResult }: QrScannerProps) {
    const [result, setResult] = React.useState<string | null>(null);
    const [error, setError] = React.useState<string | null>(null);
    const [hasScanned, setHasScanned] = React.useState(false);

    const handleResult = (detectedCodes: IDetectedBarcode[]) => {
        console.log(result);
        detectedCodes.forEach((code) => {
            setResult(code.rawValue);
            onResult?.(code.rawValue);
        });

        if (!hasScanned) {
            toast("QR Code scanned successfully", {
                position: "top-center",
            });
            setHasScanned(true);
        }
    };

    const handleError = (error: any) => {
        console.error(error);
        setError("Failed to scan QR code");
    };

    return (
        <div className="flex flex-col items-center gap-4">
            <div className="w-full max-w-md">
                <div className="relative w-full h-96 bg-black rounded overflow-hidden">
                    <Scanner onScan={handleResult} onError={handleError} />
                </div>
            </div>

            <div className="text-sm text-left w-full max-w-md">
                {error && (
                    <p className="text-sm text-red-600">Error: {error}</p>
                )}
            </div>
        </div>
    );
}
