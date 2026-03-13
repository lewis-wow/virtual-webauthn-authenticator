# Azure Key Vault

1. Create an Azure Key Vault resource in the Azure Portal.
2. Select a valid region that complies with the subscription Azure Policy restrictions (e.g.
   UK South).
3. Wait for the deployment process to complete successfully.
4. Configure local environment variables for the application and set the `AZURE_KEY_VAULT_BASE_URL` to the newly created Key Vault URI (e.g. AZURE_KEY_VAULT_BASE_URL="https://keyvaulttest101101.vault.azure.net/").
5. Authenticate the local development environment using the Azure CLI by running the `az login` command.
6. Navigate to the Key Vault Access control (IAM) settings in the Azure Portal.
7. Assign the "Key Vault Crypto Officer" role to the user or application identity to enable key generation and cryptographic operations.
