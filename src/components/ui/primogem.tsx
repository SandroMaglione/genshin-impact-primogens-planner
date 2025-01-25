import primogemImgUrl from "../../assets/images/primogem.webp";

export default function Primogem(
  props: Omit<
    React.DetailedHTMLProps<
      React.ImgHTMLAttributes<HTMLImageElement>,
      HTMLImageElement
    >,
    "src"
  >
) {
  return <img src={primogemImgUrl} alt="primogem-icon" {...props} />;
}
