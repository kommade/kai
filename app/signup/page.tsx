import { Suspense } from 'react';
import SignUpPage from './page-client';
import LoadingComponent from '@/components/LoadingComponent';

const SignUpPageWrapper = async () => {
    return (
        <Suspense fallback={<LoadingComponent/>}>
            <SignUpPage />
        </Suspense>
    )
}

export default SignUpPageWrapper;