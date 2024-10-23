import { ArrowBackIcon } from "@material-icons";
import { NavigationBar } from "../NavigationBar.tsx";

export function AddIceServerComponent({ onBack }: { onBack: () => void }) {
  return (
    <>
      <NavigationBar
        leadingComponent={
          <button className="btn btn-ghost items-center" onClick={onBack}>
            <ArrowBackIcon className="fill-current h-6 w-6" />
            Back
          </button>
        }
      />
      todo
    </>
  );
}
