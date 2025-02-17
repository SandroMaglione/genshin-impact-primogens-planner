import genesisCrystalImgUrl from "../../assets/images/genesis-crystal.webp";

export default function GenesisCrystal(
  props: Omit<
    React.DetailedHTMLProps<
      React.ImgHTMLAttributes<HTMLImageElement>,
      HTMLImageElement
    >,
    "src"
  >
) {
  return (
    <img src={genesisCrystalImgUrl} alt="genesis-crystal-icon" {...props} />
  );
}
