export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#007bff",
        secondary: "#6c757d",
        success: "#28a745",
        danger: "#dc3545",
        warning: "#ffc107",
        info: "#17a2b8",
        light: "#f8f9fa",
        dark: "#343a40",
        "border-color": "#dee2e6",
      },
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          '"Segoe UI"',
          "Roboto",
          "Oxygen",
          "Ubuntu",
          "Cantarell",
          '"Open Sans"',
          '"Helvetica Neue"',
          "sans-serif",
        ],
      },
      spacing: {
        xs: "calc(0.25 * 1rem)",
        sm: "calc(0.5 * 1rem)",
        md: "1rem",
        lg: "calc(1.5 * 1rem)",
        xl: "calc(2 * 1rem)",
      },
      borderRadius: {
        DEFAULT: "0.25rem",
      },
      borderWidth: {
        DEFAULT: "1px",
      },
      boxShadow: {
        sm: "0 0.125rem 0.25rem rgba(0, 0, 0, 0.075)",
        DEFAULT: "0 0.5rem 1rem rgba(0, 0, 0, 0.15)",
        lg: "0 1rem 3rem rgba(0, 0, 0, 0.175)",
      },
      screens: {
        sm: "576px",
        md: "768px",
        lg: "992px",
        xl: "1200px",
      },
      backgroundImage: {
        "auth-gradient": "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
        "button-gradient": "linear-gradient(to right, #007bff, #00bcd4)",
      },
    },
  },
  plugins: [],
};
