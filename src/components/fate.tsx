import fateImgUrl from "../assets/images/fate.webp";

export default function Fate(
  props: Omit<
    React.DetailedHTMLProps<
      React.ImgHTMLAttributes<HTMLImageElement>,
      HTMLImageElement
    >,
    "src"
  >
) {
  return <img src={fateImgUrl} alt="fate-icon" {...props} />;
}
