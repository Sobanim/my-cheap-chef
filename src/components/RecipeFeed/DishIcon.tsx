// import type { DishCategory } from "@/lib/menuLogic";

type DishIconProps = {
  // category: DishCategory;
  className?: string;
};

// const PATHS: Record<DishCategory, React.ReactNode> = {
//   soup: (
//     <>
//       <path
//         d="M3 11h18a8 8 0 0 1-8 8h-2a8 8 0 0 1-8-8Z"
//         stroke="currentColor"
//         strokeWidth="1.7"
//         strokeLinejoin="round"
//       />
//       <path
//         d="M9 3.5c-1 1-1 2 0 3M12 3c-1 1-1 2 0 3M15 3.5c-1 1-1 2 0 3"
//         stroke="currentColor"
//         strokeWidth="1.5"
//         strokeLinecap="round"
//       />
//     </>
//   ),
//   pan: (
//     <>
//       <circle cx="10" cy="13" r="6.2" stroke="currentColor" strokeWidth="1.7" />
//       <path
//         d="M16.2 13h5.5"
//         stroke="currentColor"
//         strokeWidth="1.7"
//         strokeLinecap="round"
//       />
//     </>
//   ),
//   bake: (
//     <>
//       <rect
//         x="3"
//         y="8"
//         width="18"
//         height="11"
//         rx="2"
//         stroke="currentColor"
//         strokeWidth="1.7"
//       />
//       <path
//         d="M7 8V6.5A2.5 2.5 0 0 1 9.5 4h5A2.5 2.5 0 0 1 17 6.5V8M8 12h8"
//         stroke="currentColor"
//         strokeWidth="1.5"
//         strokeLinecap="round"
//       />
//     </>
//   ),
//   salad: (
//     <>
//       <path
//         d="M4 11h16a8 8 0 0 1-16 0Z"
//         stroke="currentColor"
//         strokeWidth="1.7"
//         strokeLinejoin="round"
//       />
//       <path
//         d="M9 11c0-2 1.5-4 3-4M14 11c1-1.5 2.5-2 4-1.5M8 11c-1-1-1-2.5 0-3.5"
//         stroke="currentColor"
//         strokeWidth="1.5"
//         strokeLinecap="round"
//       />
//     </>
//   ),
//   grill: (
//     <>
//       <path
//         d="M5 4l14 5M5 4l14 3M6 8l12 4"
//         stroke="currentColor"
//         strokeWidth="1.5"
//         strokeLinecap="round"
//       />
//       <path
//         d="M9 12v7M15 12v7"
//         stroke="currentColor"
//         strokeWidth="1.7"
//         strokeLinecap="round"
//       />
//     </>
//   ),
// };

export const DishIcon = ({ className }: Readonly<DishIconProps>) => {
  return (
    <svg
      className={className}
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      {/*{PATHS[category]}*/}
    </svg>
  );
};
