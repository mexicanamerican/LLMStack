import { Box, Stack, TextField } from "@mui/material";
import { EmbedCodeSnippet } from "./EmbedCodeSnippets";
import { AppSaveButtons } from "./AppSaveButtons";

export function AllowedDomainsList(props) {
  const { allowedDomains, setAllowedDomains } = props;

  return (
    <TextField
      helperText="Domains that are allowed to embed this app. Use comma to separate multiple domains"
      variant="outlined"
      label="Allowed Domains"
      value={allowedDomains?.join(", ")}
      onChange={(e) => {
        const domains = e.target.value.split(",");
        setAllowedDomains(domains.map((domain) => domain.trim()));
      }}
      size="small"
    />
  );
}

export function AppWebConfigEditor(props) {
  const { app, webConfig, saveApp, setWebConfig } = props;

  return (
    <Box>
      <Stack direction="column" gap={2}>
        <EmbedCodeSnippet app={app} integration="web" />
        <AllowedDomainsList
          allowedDomains={webConfig?.allowed_sites}
          setAllowedDomains={(allowedDomains) =>
            setWebConfig({
              ...webConfig,
              allowed_sites: allowedDomains,
            })
          }
        />
      </Stack>
      <Stack
        direction="row"
        gap={1}
        sx={{
          flexDirection: "row-reverse",
          maxWidth: "900px",
          margin: "auto",
        }}
      >
        <AppSaveButtons saveApp={saveApp} />
      </Stack>
    </Box>
  );
}
