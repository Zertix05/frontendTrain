import Image from "next/image";
import { Stack } from "@mui/material";
import Link from "next/link";

export default function Home() {
  return (
   <Stack direction="row"
   justifyContent='space-around' sx={{gap:{sm:"122px", xs:'40px'}, mt:{sm:'32px', xs:'20px'}}}>
    <Link href="#">
    <Image 
    src="/assets/images/Logo.png"
    alt="logo"
    width={48}
    height={48}
    className="ml-20 mr-20" 
    />
    </Link>
    <Stack
      direction="row"
      gap="40px"
      fontFamily="Alegreya"
      fontSize="24px"
      alignItems="flex-end"
    >
      <Link href="#" style={{ textDecoration: 'none', color: '#3A1212', borderBottom: '3px solid #FF2625' }}>Home</Link>
      <Link href="#exercises" style={{ textDecoration: 'none', color: '#3A1212' }}>Exercises</Link>
    </Stack>
   </Stack>
  );
}
