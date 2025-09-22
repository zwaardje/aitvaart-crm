import { type CSSProperties, memo } from "react";
import styles from "./Spinner.module.css";

const bars = Array(12).fill(0);

export const Spinner = memo(
  ({
    color = "currentColor",
    size = 20,
  }: {
    color?: string;
    size?: number;
  }) => {
    return (
      <div
        className="h-(--spinner-size) w-(--spinner-size)"
        style={
          {
            ["--spinner-size"]: `${size}px`,
            ["--spinner-color"]: color,
          } as CSSProperties
        }
      >
        <div className={styles.root}>
          {bars.map((_, i) => (
            <div className={styles.bar} key={`spinner-bar-${i}`} />
          ))}
        </div>
      </div>
    );
  }
);

Spinner.displayName = "Spinner";
