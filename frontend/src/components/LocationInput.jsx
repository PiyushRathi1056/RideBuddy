import { useState, useRef, useEffect } from "react";

const LOCATIONS = [
  "MAHE Campus",
  "Airport T1",
  "Airport T2",
  "KSR Railway Station(SBC)",
  "Yesvantpur Railway Station(YPR)",
  "Majestic Bus Stand",
  "Electronic City",
  "Whitefield",
  "Koramangala",
  "Indiranagar",
  "MG Road",
];

export default function LocationInput({ id, name, value, onChange, placeholder }) {
  const [query, setQuery] = useState(value || "");
  const [showDropdown, setShowDropdown] = useState(false);
  const [isCustom, setIsCustom] = useState(false);
  const wrapperRef = useRef(null);

  // Filter locations based on query, always show "Other (custom)" at the end
  const filtered = LOCATIONS.filter((loc) =>
    loc.toLowerCase().includes(query.toLowerCase())
  );

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleInputChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    setShowDropdown(true);
    // Propagate up as a synthetic-style event
    onChange({ target: { name, value: val } });
  };

  const handleSelect = (location) => {
    if (location === "__custom__") {
      setIsCustom(true);
      setQuery("");
      onChange({ target: { name, value: "" } });
    } else {
      setQuery(location);
      onChange({ target: { name, value: location } });
      setIsCustom(false);
    }
    setShowDropdown(false);
  };

  const handleCustomChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    onChange({ target: { name, value: val } });
  };

  const handleBackToList = () => {
    setIsCustom(false);
    setQuery("");
    onChange({ target: { name, value: "" } });
    setShowDropdown(true);
  };

  return (
    <div ref={wrapperRef} style={{ position: "relative" }}>
      {isCustom ? (
        <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
          <input
            type="text"
            id={id}
            name={name}
            value={query}
            onChange={handleCustomChange}
            placeholder="Enter custom location"
            required
            autoFocus
            style={{ flex: 1 }}
          />
          <button
            type="button"
            onClick={handleBackToList}
            style={{
              padding: "4px 8px",
              fontSize: "12px",
              cursor: "pointer",
              background: "transparent",
              border: "1px solid gray",
              color: "gray",
              borderRadius: "4px",
              whiteSpace: "nowrap",
            }}
          >
            ← List
          </button>
        </div>
      ) : (
        <>
          <input
            type="text"
            id={id}
            name={name}
            value={query}
            onChange={handleInputChange}
            onFocus={() => setShowDropdown(true)}
            placeholder={placeholder}
            required
            autoComplete="off"
          />

          {showDropdown && (
            <ul
              style={{
                position: "absolute",
                top: "100%",
                left: 0,
                right: 0,
                background: "#1e1e1e",
                border: "1px solid #444",
                borderRadius: "4px",
                margin: 0,
                padding: 0,
                listStyle: "none",
                zIndex: 100,
                maxHeight: "220px",
                overflowY: "auto",
              }}
            >
              {filtered.map((loc) => (
                <li
                  key={loc}
                  onMouseDown={() => handleSelect(loc)}
                  style={{
                    padding: "10px 12px",
                    cursor: "pointer",
                    borderBottom: "1px solid #333",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "#2a2a2a")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  {loc}
                </li>
              ))}

              {/* Always show Other at the bottom */}
              <li
                onMouseDown={() => handleSelect("__custom__")}
                style={{
                  padding: "10px 12px",
                  cursor: "pointer",
                  color: "#aaa",
                  fontStyle: "italic",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#2a2a2a")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                Other (type custom location)
              </li>
            </ul>
          )}
        </>
      )}
    </div>
  );
}
