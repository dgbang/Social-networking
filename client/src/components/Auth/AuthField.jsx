import { TextField } from "@mui/material";

function cx(...classes) {
  return classes.filter(Boolean).join(" ");
}

function AuthField({
  label,
  type = "text",
  value,
  onChange,
  autoComplete,
  placeholder = label,
  className = "",
  inputClassName = "",
}) {
  return (
    <TextField
      fullWidth
      label={label}
      type={type}
      value={value}
      placeholder={placeholder}
      onChange={(event) => onChange(event.target.value)}
      autoComplete={autoComplete}
      margin="normal"
      className={className}
      slotProps={{
        input: {
          className: cx("!rounded-lg !bg-white", inputClassName),
        },
        htmlInput: {
          className: "!text-[15px]",
        },
      }}
    />
  );
}

export default AuthField;
