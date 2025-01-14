import LoginForm from "@/components/forms/LoginForm";

const loginPage = async({searchParams}) => {
    const redirectTo = (await searchParams)?.redirectTo || "/";
    return <LoginForm redirectTo={redirectTo}/>
};

export default loginPage;