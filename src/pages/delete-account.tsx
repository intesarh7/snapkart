import Head from "next/head";

export default function DeleteAccountPage() {
    return (
        <>
            <Head>
                <title>Delete Account – SnapKart</title>
                <meta
                    name="description"
                    content="Learn how to delete your SnapKart account, understand data retention policies, recovery timeline, and contact support for assistance."
                />
            </Head>
            {/* ===== Small Header Section ===== */}
            <div className="mb-10">
                <div className="bg-linear-to-r from-orange-500 to-orange-600 h-60 flex flex-col justify-end py-8 px-6 text-center shadow-lg relative overflow-hidden">
                    {/* Soft background glow */}
                    <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,white,transparent_70%)]"></div>
                    <h1 className="text-2xl md:text-3xl font-bold text-white relative z-10"> Delete Your SnapKart Account </h1>
                </div>
            </div>

            <div className="min-h-screen bg-gray-50 py-12 px-6">
                <div className="max-w-4xl mx-auto bg-white shadow-xl rounded-2xl p-8">

                    <h1 className="text-3xl font-bold text-gray-800 mb-6">
                        Delete Your SnapKart Account
                    </h1>

                    <p className="text-gray-600 mb-6">
                        At SnapKart, we respect your privacy and give you full control over
                        your account. You may request account deletion directly from within
                        the SnapKart mobile app or website.
                    </p>

                    {/* Deletion Process */}
                    <section className="mb-8">
                        <h2 className="text-xl font-semibold mb-3 text-gray-800">
                            How to Delete Your Account
                        </h2>
                        <ul className="list-disc pl-6 text-gray-600 space-y-2">
                            <li>Login to your SnapKart account.</li>
                            <li>Go to your Profile or Account Settings.</li>
                            <li>Click on “Delete Account”.</li>
                            <li>Confirm your deletion request.</li>
                        </ul>
                        <p className="mt-4 text-gray-600">
                            Once confirmed, your account will be marked as deleted and you
                            will no longer be able to access it.
                        </p>
                    </section>

                    {/* Data Retention */}
                    <section className="mb-8">
                        <h2 className="text-xl font-semibold mb-3 text-gray-800">
                            What Happens to Your Data?
                        </h2>
                        <p className="text-gray-600 mb-4">
                            When you delete your account:
                        </p>
                        <ul className="list-disc pl-6 text-gray-600 space-y-2">
                            <li>Your login access is immediately disabled.</li>
                            <li>Your personal profile information is marked as deleted.</li>
                            <li>
                                Certain transaction records (such as completed orders or
                                payment records) may be retained for legal, tax, and fraud
                                prevention purposes.
                            </li>
                        </ul>
                    </section>

                    {/* Recovery Timeline */}
                    <section className="mb-8">
                        <h2 className="text-xl font-semibold mb-3 text-gray-800">
                            Account Recovery Window
                        </h2>
                        <p className="text-gray-600">
                            SnapKart provides a 30-day recovery period after account
                            deletion. During this time:
                        </p>
                        <ul className="list-disc pl-6 text-gray-600 space-y-2 mt-2">
                            <li>
                                Your account can be restored upon request by contacting our
                                support team.
                            </li>
                            <li>
                                After 30 days, your account and associated personal data will
                                be permanently deleted from our system.
                            </li>
                        </ul>
                    </section>

                    {/* Contact Support */}
                    <section>
                        <h2 className="text-xl font-semibold mb-3 text-gray-800">
                            Need Help?
                        </h2>
                        <p className="text-gray-600">
                            If you are unable to access your account or need assistance with
                            account deletion or recovery, please contact us at:
                        </p>

                        <div className="mt-4 bg-gray-100 p-4 rounded-lg">
                            <p className="text-gray-800 font-medium">
                                📧 support@snapkart.in OR Call Us - +91-8510860215
                            </p>
                        </div>
                    </section>

                </div>
            </div>
        </>
    );
}