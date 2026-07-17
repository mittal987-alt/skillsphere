const forgotPasswordEmail = (link) => {

return `

<h2>Reset Password</h2>

<p>

Click the button below to reset your password.

</p>

<a href="${link}">

Reset Password

</a>

`;

};

export default forgotPasswordEmail;