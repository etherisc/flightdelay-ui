import { redirect } from 'next/navigation';
import { PATH_APPLICATION } from '../utils/paths';

export default function Page() {
    redirect(PATH_APPLICATION);
}

