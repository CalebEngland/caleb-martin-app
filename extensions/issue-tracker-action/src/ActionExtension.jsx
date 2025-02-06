import { useEffect, useState, useCallback } from "react";
import {
  reactExtension,
  useApi,
  AdminAction,
  Button,
  TextField,
  Box,
  TextArea,
} from "@shopify/ui-extensions-react/admin";

import { getIssues, updateIssues } from "./utils";

function generateId(allIssues) {
  return !allIssues?.length ? 0 : allIssues[allIssues.length - 1].id + 1;
}

function validateForm({ title, description }) {
  return {
    isValid: Boolean(title) && Boolean(description),
    errors: {
      title: !title,
      description: !description,
    },
  };
}

// The target used here must match the target used in the extension's toml file (./shopify.extension.toml)
const TARGET = "admin.product-details.action.render";

export default reactExtension(TARGET, () => <App />);

function App() {
  const { close, data } = useApi(TARGET);
  const [issue, setIssue] = useState({ title: "", description: "" });
  const [allIssues, setAllIssues] = useState([]);
  const [formErrors, setFormErrors] = useState(null);
  const { title, description } = issue;

  useEffect(() => {
    let mounted = true;
    getIssues(data.selected[0].id).then((issues) => {
      if (mounted) {
        setAllIssues(issues || []);
      }
    });
    return () => {
      mounted = false;
    };
  }, [data.selected[0].id]);

  const onSubmit = useCallback(async () => {
    const { isValid, errors } = validateForm(issue);
    setFormErrors(errors);

    if (isValid) {
      await updateIssues(data.selected[0].id, [
        ...allIssues,
        {
          id: generateId(allIssues),
          completed: false,
          ...issue,
        },
      ]);
      close();
    }
  });
  return (
    // The AdminAction component provides an API for setting the title and actions of the Action extension wrapper.
    <AdminAction
      primaryAction={<Button onPress={onSubmit}>Create</Button>}
      secondaryAction={<Button onPress={close}>Close</Button>}
    >
      <TextField
        value={title}
        error={formErrors?.title ? "Please enter a title" : undefined}
        onChange={(val) => setIssue((prev) => ({ ...prev, title: val }))}
        label="Title"
        maxLength={50}
      />
      <Box paddingBlockStart="large">
        <TextArea
          value={description}
          error={
            formErrors?.description ? "Please enter a description" : undefined
          }
          onChange={(val) =>
            setIssue((prev) => ({ ...prev, description: val }))
          }
          label="Description"
          maxLength={300}
        />
      </Box>
    </AdminAction>
  );
}
