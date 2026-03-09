import styles from "./Tag.module.css";

interface Props {
  type: "yes" | "no" | "maybe" | "neutral";
  children: React.ReactNode;
}

export default function Tag({ type, children }: Props) {
  return (
    <span className={`${styles.tag} ${styles[type]}`}>
      {children}
    </span>
  );
}