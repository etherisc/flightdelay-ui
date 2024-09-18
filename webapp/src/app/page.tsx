import { redirect } from 'next/navigation';
import { PATH_SIGNUP } from '../utils/paths';

export default function Page() {
    redirect(PATH_SIGNUP);
}

