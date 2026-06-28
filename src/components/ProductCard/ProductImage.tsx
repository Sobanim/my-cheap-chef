import Image from 'next/image';
import styles from './ProductCard.module.css';

type ProductImageProps = {
  imageUrl: string;
  name: string;
};

export const ProductImage = ({ imageUrl, name }: Readonly<ProductImageProps>) => {
  return (
    <div className={styles.imageWrapper}>
      <Image
        src={imageUrl}
        alt={name}
        width={427}
        height={320}
        className={styles.image}
      />
    </div>
  );
};
