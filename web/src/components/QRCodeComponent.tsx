import { QRCode } from "@maksimowicz/qrcode-svg";
import { useEffect, useRef } from "react";

interface Props {
  message: string;
  size?: number;
  padding?: number;
  mask?: undefined | 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;
  errorCorrectionLevel?: "L" | "M" | "Q" | "H";
  errorCorrectionBoost?: boolean;
  color?: [string, string];
  verbose?: boolean;
  fill?: string;

  className?: string;
}
export const QRCodeComponent = (props: Props) => {
  const svgRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const svgNode = QRCode(props);

    if (props.fill) {
      svgNode.style.fill = props.fill;
    }

    if (svgRef.current) {
      svgRef.current.appendChild(svgNode);
    }

    return () => {
      if (svgRef.current) {
        svgRef.current.innerHTML = "";
      }
    };
  }, [props]);

  return <div className={props.className} ref={svgRef} />;
};
