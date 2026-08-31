import moringaIcon from '../../assets/moringa-icon.png';

// Moringa School's actual icon mark (cropped from their site's own logo
// asset, moringaschool.com), used here since MoringaDesk is a student
// project built for and branded around Moringa School itself.
export default function Logo({ size = 26 }) {
  return (
    <img
      src={moringaIcon}
      alt="Moringa"
      width={size}
      height={size}
      style={{ objectFit: 'contain', display: 'block' }}
    />
  );
}
