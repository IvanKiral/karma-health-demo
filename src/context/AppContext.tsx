import { useAuth0 } from "@auth0/auth0-react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createContext, FC, PropsWithChildren, useContext } from "react";
import { useParams } from "react-router-dom";
import { loadPreviewApiKey } from "../utils/api";

type AppContext = {
  environmentId: string;
  apiKey: string;
  collection: string;
};

const defaultAppContext: AppContext = {
  environmentId: import.meta.env.VITE_ENVIRONMENT_ID!,
  apiKey: import.meta.env.VITE_DELIVERY_API_KEY!,
  collection: import.meta.env.VITE_COLLECTION!,
};

const AppContext = createContext<AppContext>(defaultAppContext);

export const useAppContext = () => useContext(AppContext);

export const AppContextComponent: FC<PropsWithChildren> = ({ children }) => {
  const { envId } = useParams();
  const { getAccessTokenSilently, loginWithRedirect } = useAuth0();

  const contextData = useSuspenseQuery({
    queryKey: [`env-data${envId ? `-${envId}` : ""}`],
    queryFn: () => {
      if (!envId) {
        return defaultAppContext;
      }
      return getAccessTokenSilently()
        .then(res => {
          return loadPreviewApiKey({
            accessToken: res,
            environmentId: envId,
          });
        })
        .then(res => {
          if (!res) {
            throw new Error("Could not obtain preview API KEY");
          }

          return { environmentId: envId, apiKey: res, collection: import.meta.env.VITE_COLLECTION! };
        })
        .catch(err => {
          if (err.error === "login_required") {
            loginWithRedirect();
          }
          if (err.error === "consent_required") {
            loginWithRedirect();
          }
          throw err;
        });
    },
  });

  return (
    <AppContext.Provider value={contextData.data}>
      {children}
    </AppContext.Provider>
  );
};
