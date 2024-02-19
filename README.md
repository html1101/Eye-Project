<h1>OptoPulse AI</h1>
<h2>The What</h2>
<i>An all-in-one AI platform designed to evaluate and analyze optometric information, such as elevated dry eye risk and basic vision tests.</i>

<h2>The Why</h2>
$134.2 <b>billion</b> is estimated to be spent on vision-related impairments.

This project poses a solution to benefit both healthcare providers and patients by completely automating mundane vision tests.

<h2>The How</h2>
This suite offers a variety of vision tests; at the moment, the following two services are offered:

- <b>Snell Chart Test</b> - this is a variation of the test typically administered at an annual physical to measure visual acuity. The test uses pose detection to ensure the patient is the right distance away from the chart, then allows the user to spell out the letters they can read (currently in progress).
- <b>Dry Eye Evaluation</b> - a dry eye diagnosis is expensive, time-consuming, and difficult to do (especially if a patient doesn't have a dedicated optometrist). This evaluation attempts to target the source of the problem for most patients: screens. This prompts a user to read a text while capturing eye movement data to detect how frequently the user is blinking (using AI). Blinking less often suggests that a user may have dry eyes.

<h2>Installation</h2>

Data is saved and operations are performed entirely locally, excluding voice detection. After saving this folder:

1. Install NodeJS.
2. Run `npm install`. This will install the packages necessary for running this code.
3. Run `npm start`. This will start the server, which can be accessed at [http://localhost:8080](http://localhost:8080).
4. Access the model! Important to note: make sure to have permissions _enabled_ for microphone and webcam access (this may need to be performed manually)!
