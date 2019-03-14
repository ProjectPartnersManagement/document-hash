# Blockchain Document Hash

Write the hash of any file to an Ethereum-compatible blockchain. The hash enables you to prove the existence of the document when the block was mined. Use cases include:

**Patents**

Company A is working on technical innovations. During development, it can hash the PDF files of its various states of development and write the hash onto the Blockchain. The patent should not be published immediately in order to maximize the time the company can use the patent after going to market. Until then, the company does research below the radar.

A competitor B does R&D for a comparable technology – and even completes it earlier. The competitor files for a patent. In order to prove the patent invalid due to the knowledge having been available at company A before, company A can hash the document again. The hash being contained in an old block on the Ethereum blockchain is proof that company A possessed knowledge of the technology in the past.

**Meeting Minutes for a Legal Case**

A service provider and its customer go to court over an expensive failed project. In order to prove their correct conduct, the service provider presents a meeting minutes document supporting his claims. The client disagrees by stating that the meeting minutes are false evidence: They were created recently with the legal case in mind.

Since the service provider always saves the hash of all their meeting minutes onto the blockchain he can prove the meeting minutes to be authentic. He wins the case.

**Pitch Decks**

A consulting company pitches its blockchain ideas to a potential client. Supplementing the NDA, they write the hash of a document containing the concepts they'll pitch onto the blockchain. They ask the potential client to create a document containing their current knowledge of potential use cases relating to the pitch topic. The hash of that document is saved to the blockchain, too.

After the pitch, the potential client states that the ideas were not new. He wants to execute the concepts delivered by the consulting company with another cheaper consulting agency. Who's right? To resolve the dispute, both parties can show the other party what concepts the hashed document contained.

## Installation
The installation requires two steps:
1. Compile Angular application.
1. Set up nginx server.

We assume you installed [MetaMask](https://metamask.io/) in your browser.

### Compile Angular App
Clone this repository

`git clone https://github.com/ProjectPartnersManagement/document-hash`

Change into the cloned directory

`cd document-hash`

Install JavaScript dependencies

`npm install`

Compile angular app

`npm run aot`

### Set up Nginx
Install nginx - *If you use another operating system than Ubuntu, please consult the [official nginx documentation](https://docs.nginx.com/nginx/admin-guide/installing-nginx/installing-nginx-open-source/).*

`apt-get install nginx`

Copy the nginx configuration files from `document-hash/nginx/` to your `/etc/nginx/`.

Rename `/etc/nginx/sites-available/your-domain-name.local` to a more meaningful name. Replace the file's contents accordingly.
Add the local domain you chose to your [hosts file](https://support.rackspace.com/how-to/modify-your-hosts-file/).

Create a symbolic link to your new configuration file so that nginx knows you want to use this config

`cd /etc/nginx/sites-enabled/ && sudo ln -s ../sites-available/your-domain-name.local`

Restart nginx

`sudo service nginx restart`

### Conclusion

If everything worked, you should be able to see the web application with your favorite browser (we use Firefox & Chrome).

![Screenshot of the Document Hash Blockchain Application](https://github.com/ProjectPartnersManagement/document-hash/raw/master/readme-src/screenshot-first-page.png "Screenshot of the first page")

## Blockchain Services
If you like this case and need assistance thinking of how the Blockchain can transform your enterprise, visit our website at https://blockchain.project-partners.de. The website is German but we're used to working with international clients.

## License
The Document Hash Project is [MIT licensed](https://github.com/ProjectPartnersManagement/document-hash/blob/master/LICENSE).