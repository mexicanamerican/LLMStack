import React, { useState, useMemo, useEffect, useCallback } from "react";
import {
  Popper,
  Paper,
  Grow,
  Stack,
  Select,
  MenuItem,
  Button,
  Typography,
  InputLabel,
  Checkbox,
  FormControlLabel,
} from "@mui/material";
import DataTransformerGeneratorWidget from "./DataTransformerGeneratorWidget";
import AppRunForm from "./AppRunForm";
import ProcessorRunForm from "./ProcessorRunForm";

const formulaTypes = {
  data_transformer: {
    value: "data_transformer",
    label: "Data Transformer",
    description: "Transform data using a LiquidJS template",
  },
  app_run: {
    value: "app_run",
    label: "App Run",
    description: "Run an app to generate formula output",
  },
  processor_run: {
    value: "processor_run",
    label: "Processor Run",
    description: "Run a processor to generate formula output",
  },
};

const SheetFormulaMenu = ({
  anchorEl,
  open,
  onClose,
  cellId,
  formulaCells,
  setFormulaCell,
}) => {
  const [formulaType, setFormulaType] = useState(
    formulaCells[cellId]?.formula?.type || "",
  );
  const [transformationTemplate, setTransformationTemplate] = useState(
    formulaCells[cellId]?.formula?.data?.transformation_template || "",
  );
  const [formulaData, setFormulaData] = useState(
    formulaCells[cellId]?.formula?.data || {},
  );
  const formulaDataRef = React.useRef(
    formulaCells[cellId]?.formula?.data || {},
  );
  const [spreadOutput, setSpreadOutput] = useState(false);

  const setDataHandler = useCallback(
    (data) => {
      formulaDataRef.current = {
        ...formulaDataRef.current,
        ...data,
      };
    },
    [formulaDataRef],
  );

  useEffect(() => {
    formulaDataRef.current = formulaCells[cellId]?.formula?.data || {};
    setFormulaType(formulaCells[cellId]?.formula?.type || "");
    setTransformationTemplate(
      formulaCells[cellId]?.formula?.data?.transformation_template || "",
    );
    setFormulaData(formulaCells[cellId]?.formula?.data || {});
    setSpreadOutput(
      formulaCells[cellId]?.formula?.data?.spread_output || false,
    );
  }, [cellId, formulaCells, setFormulaData, setFormulaType]);

  const memoizedProcessorRunForm = useMemo(
    () => (
      <ProcessorRunForm
        setData={setDataHandler}
        providerSlug={formulaData?.provider_slug}
        processorSlug={formulaData?.processor_slug}
        processorInput={formulaData?.input}
        processorConfig={formulaData?.config}
        processorOutputTemplate={formulaData?.output_template}
      />
    ),
    [setDataHandler, formulaData],
  );

  const handleApplyFormula = () => {
    const newFormula = {
      type: formulaType,
      data: {
        ...formulaDataRef.current,
        transformation_template: transformationTemplate,
        spread_output: spreadOutput,
      },
    };
    setFormulaCell(cellId, newFormula);
    formulaDataRef.current = null;
    setTransformationTemplate("");
    setFormulaType("data_transformer");
    onClose();
  };

  const handleClearFormula = () => {
    setFormulaCell(cellId, null);
    onClose();
  };

  return (
    <Popper
      open={open}
      anchorEl={anchorEl}
      role={undefined}
      placement="bottom-start"
      transition
      sx={{
        width: "450px",
        maxHeight: "90vh",
        overflowY: "auto",
        padding: "0px 2px 8px 2px",
      }}
    >
      {({ TransitionProps, placement }) => (
        <Grow
          {...TransitionProps}
          style={{
            transformOrigin:
              placement === "bottom-start" ? "left top" : "left bottom",
          }}
        >
          <Paper
            sx={{
              border: "solid 2px #e0e0e0",
              borderTop: "none",
              marginLeft: "-2px",
            }}
          >
            <Stack gap={2} sx={{ padding: 2 }}>
              <InputLabel>Formula: {cellId}</InputLabel>
              <Typography variant="caption" color="text.secondary">
                Select the type of formula you want to apply
              </Typography>
              <Select
                value={formulaType}
                onChange={(e) => setFormulaType(e.target.value)}
              >
                {Object.keys(formulaTypes).map((type) => (
                  <MenuItem key={type} value={type}>
                    <Stack spacing={0}>
                      <Typography variant="body1">
                        {formulaTypes[type].label}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {formulaTypes[type].description}
                      </Typography>
                    </Stack>
                  </MenuItem>
                ))}
              </Select>
              {(formulaType === "data_transformer" ||
                formulaType === "app_run" ||
                formulaType === "processor_run") && (
                <Typography variant="caption" color="text.secondary">
                  You can access the output from previous cell or a range of
                  cells using the cell ids. For example, <code>{"{{A1}}"}</code>{" "}
                  refers to the value in the cell with column A and row 1.{" "}
                  <code>{"{{A1-B10}}"}</code> returns a list of values from
                  cells A1 to B10. To access all the values in a column as a
                  list, use <code>{"{{A}}"}</code>, where A is the column
                  letter.
                  <br />
                  &nbsp;
                </Typography>
              )}
              {formulaType === "data_transformer" && (
                <>
                  <DataTransformerGeneratorWidget
                    label="Transformation Template"
                    value={transformationTemplate}
                    onChange={(value) => setTransformationTemplate(value)}
                    multiline
                    rows={4}
                    placeholder="Enter LiquidJS template"
                    helpText={
                      "Use LiquidJS syntax to transform data from other cells. Example: {{ A1 | upcase }}. The 'A1' variable contains the A1 cell's value."
                    }
                  />
                </>
              )}
              {formulaType === "app_run" && (
                <AppRunForm
                  setData={(data) => {
                    formulaDataRef.current = {
                      ...formulaDataRef.current,
                      ...data,
                    };
                  }}
                  appSlug={formulaDataRef.current?.app_slug}
                  appInput={formulaDataRef.current?.input}
                />
              )}
              {formulaType === "processor_run" && memoizedProcessorRunForm}
              {formulaType && (
                <>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={spreadOutput}
                        onChange={(e) => setSpreadOutput(e.target.checked)}
                      />
                    }
                    label="Spread output into cells"
                  />
                  <Typography variant="caption" color="text.secondary">
                    If the output is a list, it will fill the column. If the
                    output is a list of lists, it will populate the cells in
                    rows and columns starting from the top-left cell. Use{" "}
                    <code>to_json</code> in the template to output a JSON object
                    that can be parsed into a list of lists.
                  </Typography>
                </>
              )}
              <Stack direction="row" spacing={2} justifyContent="flex-end">
                <Button sx={{ textTransform: "none" }} onClick={onClose}>
                  Cancel
                </Button>
                <Button
                  sx={{ textTransform: "none" }}
                  variant="outlined"
                  onClick={handleClearFormula}
                >
                  Clear
                </Button>
                <Button variant="contained" onClick={handleApplyFormula}>
                  Apply
                </Button>
              </Stack>
            </Stack>
          </Paper>
        </Grow>
      )}
    </Popper>
  );
};

export default SheetFormulaMenu;
