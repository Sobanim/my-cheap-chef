import styles from "./Footer.module.scss";

export const Footer = () => {
  const currentYear = new Date().getFullYear();
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        {/*<div className={styles.brand}>*/}
        {/*  My Cheap Chef*/}
        {/*</div>*/}
        <p className={styles.disclaimer}>
          Tento projekt je nezávislý a nie je oficiálne spojený, sponzorovaný ani schválený 
          spoločnosťou Lidl Slovenská republika, v.o.s. Všetky ochranné známky a logá patria 
          ich príslušným majiteľom.
        </p>
        <p className={styles.copyright}>
          &copy; {currentYear} My Cheap Chef. Vytvorené pre šikovných gurmánov.
        </p>
      </div>
    </footer>
  );
};
