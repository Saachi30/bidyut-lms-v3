import { useEffect, useState } from "react";

const ScreenshotBlocker = () => {
  const [showBlackout, setShowBlackout] = useState(false);
  useEffect(() => {
    const clearClipboard = () => {
      navigator.clipboard.writeText(""); // Clear clipboard to prevent pasting images
    };
  
    document.addEventListener("keyup", (e) => {
      if (e.key === "PrintScreen") {
        clearClipboard();
        alert("Screenshots are disabled!");
      }
    });
  
    document.addEventListener("keydown", (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        alert("Saving is disabled!");
      }
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === "s") {
        e.preventDefault();
        alert("Saving is disabled!");
      }
    });
  
    return () => {
      document.removeEventListener("keyup", clearClipboard);
      document.removeEventListener("keydown", clearClipboard);
    };
  }, []);
  
  useEffect(() => {
    const handleScreenshot = () => {
      setShowBlackout(true);
      setTimeout(() => setShowBlackout(false), 1000); // Hide black screen after 1 sec
    };

    const handleKeyDown = (e) => {
      if (e.key === "PrintScreen") {
        e.preventDefault(); // Block PrintScreen
        handleScreenshot();
      }
    };

    const handleCopyAttempt = () => {
      handleScreenshot();
    };

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("copy", handleCopyAttempt);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("copy", handleCopyAttempt);
    };
  }, []);

  return (
    <div>
      {showBlackout && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            background: "black",
            zIndex: 9999,
          }}
        ></div>
      )}
    </div>
  );
};

export default ScreenshotBlocker;
