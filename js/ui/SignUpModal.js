import { sendVerificationCodeClicked, verifyCodeClicked } from '../PaiShoMain';

export function buildSignUpModalContentElement() {
	// Create the container div
	const signUpModalContentContainer = document.createElement('div');
	signUpModalContentContainer.id = 'signUpModalContentContainer';
	signUpModalContentContainer.style.display = 'none';

	// Add the first paragraph
	const paragraph1 = document.createElement('p');
	paragraph1.textContent =
		"To sign up as a new player, enter your username, email, and password, then enter the 4-digit code sent to you to sign into The Garden Gate.";
	signUpModalContentContainer.appendChild(paragraph1);

	// Add the second paragraph
	const paragraph2 = document.createElement('p');
	paragraph2.textContent =
		"To sign in with email verification, enter your username and email but leave the password fields blank.";
	signUpModalContentContainer.appendChild(paragraph2);

	// Create the center-aligned container
	const centerContainer = document.createElement('div');
	centerContainer.style.textAlign = 'center';

	// Create the table for user inputs
	const inputTable = document.createElement('table');
	inputTable.style.margin = 'auto';

	// Create rows for each input field
	const createRow = (labelText, inputId, inputType) => {
		const row = document.createElement('tr');
		const labelCell = document.createElement('td');
		labelCell.style.textAlign = 'right';
		labelCell.textContent = labelText;

		const inputCell = document.createElement('td');
		const input = document.createElement('input');
		input.id = inputId;
		input.type = inputType;
		input.name = inputId;
		inputCell.appendChild(input);

		row.appendChild(labelCell);
		row.appendChild(inputCell);
		return row;
	};

	inputTable.appendChild(createRow('Username:', 'usernameInput', 'text'));
	inputTable.appendChild(createRow('Email:', 'userEmailInput', 'email'));
	inputTable.appendChild(createRow('Password (if signing up):', 'userPasswordInput', 'password'));
	inputTable.appendChild(createRow('Verify Password (if signing up):', 'userPasswordCheckInput', 'password'));

	// Append the input table
	centerContainer.appendChild(inputTable);

	// Create the "Send verification code" button
	const verificationCodeButtonContainer = document.createElement('div');
	const sendVerificationButton = document.createElement('button');
	sendVerificationButton.type = 'button';
	sendVerificationButton.className = 'signupbutton';
	sendVerificationButton.textContent = 'Send verification code';
	sendVerificationButton.onclick = () => sendVerificationCodeClicked();

	verificationCodeButtonContainer.appendChild(sendVerificationButton);
	verificationCodeButtonContainer.appendChild(document.createElement('br'));

	// Add the response div
	const verificationCodeSendResponse = document.createElement('div');
	verificationCodeSendResponse.id = 'verificationCodeSendResponse';
	verificationCodeSendResponse.textContent = '\u00A0';
	verificationCodeButtonContainer.appendChild(verificationCodeSendResponse);

	centerContainer.appendChild(verificationCodeButtonContainer);

	// Add spacing
	centerContainer.appendChild(document.createElement('br'));

	// Create the table for the verification code
	const verificationCodeTable = document.createElement('table');
	verificationCodeTable.style.margin = 'auto';
	verificationCodeTable.appendChild(createRow('Code:', 'verificationCodeInput', 'text'));

	// Disable the input initially
	verificationCodeTable.querySelector('#verificationCodeInput').disabled = true;

	// Append the verification code table
	centerContainer.appendChild(verificationCodeTable);

	// Create the "Verify code" button
	const verifyCodeButtonContainer = document.createElement('div');
	const verifyCodeButton = document.createElement('button');
	verifyCodeButton.id = 'verifyCodeBtn';
	verifyCodeButton.className = 'signupbutton';
	verifyCodeButton.type = 'button';
	verifyCodeButton.textContent = 'Verify code';
	verifyCodeButton.onclick = () => verifyCodeClicked();

	verifyCodeButtonContainer.appendChild(verifyCodeButton);
	centerContainer.appendChild(verifyCodeButtonContainer);

	// Append the center container to the main container
	signUpModalContentContainer.appendChild(centerContainer);

	// The `signUpModalContentContainer` now holds the full DOM structure
	return signUpModalContentContainer;
}
