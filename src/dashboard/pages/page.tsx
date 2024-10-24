import {
  Button,
  EmptyState,
  Page,
  WixDesignSystemProvider,
  Box,
  Input,
  Text,
  Modal,
  Heading,
  IconButton ,
  CustomModalLayout
} from "@wix/design-system";
import "@wix/design-system/styles.global.css";
import * as Icons from "@wix/wix-ui-icons-common";
import React from "react";
import "./page.css"
import { withDashboard, useDashboard } from "@wix/dashboard-react";

function Index() {

  const [subdomain, setSubDomain] = React.useState('');

  const [isModalOpened, setModalOpened] = React.useState(false);

  const [subDomainValidated, setSubDomainValidated] = React.useState(false);

  const [showBtmModal, setShowBtmModal] = React.useState(false);

  const [regiSubdomain, setRegiSubdomain] = React.useState('');

  const [instanceId, setInstanceId] = React.useState('');

  const openModal = () => setModalOpened(true);
  const closeModal = () => setModalOpened(false);

  React.useEffect(() => {
    const params = new URL(location.href).searchParams;
    const instance = params.get('instance');
    const hashedInstance = instance.split('.');
    
    const decodedInstance  = atob(hashedInstance[1]);
    const instanceIdJson = JSON.parse(decodedInstance)
    // console.log("Query",instanceIdJson);
    const instanceId = instanceIdJson.instanceId;
    setInstanceId(instanceId)

    async function fetchSubdomain(insId:any) {

      let response:any = await fetch(`${import.meta.env.VITE_SERVER_URL}check-subdomain?instanceId=${insId}`)
      response = await response.json()
      // console.log("xmlHttp", response);
      if(response["statusCode"] == 200) {
        console.log("adsfadsfdsa")
        setShowBtmModal(true)
        setRegiSubdomain(response.body?.["subdomain"])
      }
      return response
    }
    fetchSubdomain(instanceId);
    
  }, []);

  const renderModalContent = () => (
    <Box className="modal--subdomain" width="100%">
      <Box className="modal--inner" direction="vertical" width="100%"> 
        <Box backgroundColor={subDomainValidated ? "#29845B" : "#b93e3e"} width="100%" padding={"SP2 SP2"} className="modal--upper" verticalAlign="middle">
          <Box paddingRight="SP1">
            {subDomainValidated ? (
              <Icons.Confirm color="#fff" width="20px" height="20px" />
            ) : (
              <Icons.StatusIndeterminate color="#fff" width="20px" height="20px" />
            )}
          </Box>
          <Text light width="100%"> Subdomain Validation {subDomainValidated ? 'Success' : 'Failed'}</Text>
        </Box>
        <Box className="modal--bottom" padding={"SP1 SP2 SP2"}>
        { subDomainValidated ?
         <Text color="#000" display="block">Domain registration complete.</Text>
         : <Text color="#000" display="block">Please configure your subdomain within datahash platform</Text>}
        </Box>
      </Box>
    </Box>
  );


  const renderBtmModalContent = () => (
    <Box className="modal--subdomain" width="100%">
      <Box className="modal--inner" direction="vertical" width="100%"> 
        <Box width="100%" padding={"SP2 SP2"} className="modal--upper" verticalAlign="middle">
          <Box paddingRight="SP1">
              <Icons.Confirm color="#29845B" width="20px" height="20px" />
          </Box>
          <Text weight="bold" width="100%">Sub Domain Registered</Text>
        </Box>
        <Box className="modal--bottom" padding={"SP1 SP2 SP2"}>
         <Text color="#000" display="block">The subdomain <strong>{regiSubdomain}</strong> is already registered with this account and being tracked.</Text>
        </Box>
      </Box>
    </Box>
  );

  const handleSubDomain = async() => {
    const theUrl = `${import.meta.env.VITE_SUBDOMAIN_VALID_URL}?subdomain=${subdomain}`;
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open( "GET", theUrl, false ); // false for synchronous request
    xmlHttp.send( null );
    // return xmlHttp.responseText;
    console.log("typeof>>>>",xmlHttp)

    if(xmlHttp.status != 404) {
      const data = {
        "instanceId": instanceId,
        "parameters" : {
          "subdomain" : subdomain
        }
      }

      const response = await fetch(`${import.meta.env.VITE_SERVER_URL}embed-scripts`, {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {
        'Content-Type': 'application/json'
        }
      });

      // console.log("response", response)

      if(response) {
        setSubDomainValidated(true)
      } else {
        setSubDomainValidated(false)
      }

    } else {
      setSubDomainValidated(false)
    }
    
    setModalOpened(true)
  } 

  return (
    <WixDesignSystemProvider>
      <Page>
        <Page.Header className="dashboard--header"
          title="Welcome to Datahash"
        />
        <Page.Content>

          {isModalOpened &&
           <CustomModalLayout 
            onCloseButtonClick={() => {setModalOpened(false)}}
            showFooterDivider="false"
            showHeaderDivider="false"
            title=""
            content={renderModalContent()}
            className="modal--outer"
          />}

          <Box backgroundColor="#fff" direction="vertical" padding="SP4" borderRadius={12} border="1px solid" borderColor="#e5e5e5"  gap="48px" margin="SP6 0 0 0">
            <Box direction="vertical">
              <Heading size="small" >Step 1: Setup Subdomain</Heading>
              <Text><a href="https://studio.datahash.com/start?plan=web-capi-10k-free" target="_blank">Click here</a> to log in to Datahash account and setup subdomain</Text>
            </Box>
            {showBtmModal && regiSubdomain &&
             <Box className="modal--btm-otr">
              <CustomModalLayout 
                onCloseButtonClick={() => {setShowBtmModal(false)}}
                showFooterDivider="false"
                showHeaderDivider="false"
                title=""
                content={renderBtmModalContent()}
                className="modal--btm"
              />
            </Box>}
            <Box direction="vertical">
              <Heading size="small" >Step 2: Save Subdomain</Heading>
              <Text>Enter your subdomain to enable server to server first-party tracking</Text>
              <Box verticalAlign="top" margin="SP2 0">
                <Input className="subdomainField" size="medium" onChange={(e) => {setSubDomain(e.target.value)}}/>
                <Button className="subdomainBtn" size="medium" border="5px solid" color="#000" onClick={() => {
                  handleSubDomain()
                }}>Enable Tracking</Button>
              </Box>
              <Text>Note:</Text>
              <Text listStyle="circle">
                <ul className="subdomainNotes">
                  <li>Host the subdomain under the domain registry of your main domain.</li>
                  <li>Do not host subdomain as a primary domain in the DNS registry.</li>
                </ul>
              </Text>
            </Box>
            
            <Box direction="vertical">
              <Text>For more details <a href="https://www.datahash.com/" target="_blank">Click Here</a>, if you are still facing difficulties reach out to <a href="mailto:support@datahash.com">support@datahash.com</a></Text>
            </Box>
          </Box>
        </Page.Content>
      </Page>
    </WixDesignSystemProvider>
  );
}

export default withDashboard(Index);