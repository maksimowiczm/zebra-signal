import { CloseIcon } from "@material-icons";
import {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

type Variant = "none" | "info" | "success" | "warning" | "error";

interface SnackbarContextType {
  (message: string, variant: Variant, timeout?: number): void;
}

export const SnackbarContext = createContext<SnackbarContextType | undefined>(
  undefined,
);

interface SnackbarProviderProps {
  children: ReactNode;
}

interface SnackbarState {
  show: boolean;
  message: string;
  variant: Variant;
}

export function SnackbarProvider({ children }: SnackbarProviderProps) {
  const [snackbar, setSnackbar] = useState<SnackbarState>({
    show: false,
    message: "",
    variant: "success",
  });
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleClose = () => setSnackbar((prev) => ({ ...prev, show: false }));

  const showSnackbar = useCallback<SnackbarContextType>(
    (message, variant, timeout = 5000) => {
      setSnackbar({ show: true, message, variant });

      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }

      timerRef.current = setTimeout(() => {
        handleClose();
        timerRef.current = null;
      }, timeout);
    },
    [],
  );

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  return (
    <SnackbarContext.Provider value={showSnackbar}>
      {children}
      <div
        role="alert"
        // <div className="alert-info alert-error alert-success alert-warning" />
        className={
          `alert alert-${snackbar.variant} ` +
          `${snackbar.show ? "translate-y-0" : "translate-y-[200%]"} transition-transform ` +
          "fixed bottom-2 mx-2 w-[calc(100%-1rem)] lg:w-[calc(100%-30rem)] lg:mx-60 " +
          "flex justify-between items-center"
        }
      >
        {snackbar?.message}
        <div
          className="hover:bg-black/20 p-1 rounded-full cursor-pointer fill-current"
          onClick={handleClose}
        >
          <CloseIcon className="fill-current" height={24} width={24} />
        </div>
      </div>
    </SnackbarContext.Provider>
  );
}

export const useSnackbar = (): SnackbarContextType => {
  const context = useContext(SnackbarContext);
  if (!context) {
    throw new Error("useSnackbar must be used within a SnackbarProvider");
  }
  return context;
};
