export default function Container({ children }) {
  return (
    <div
      style={{
        width: "90%",
        maxWidth: "1200px",
        margin: "40px auto",
      }}
    >
      {children}
    </div>
  );
}
