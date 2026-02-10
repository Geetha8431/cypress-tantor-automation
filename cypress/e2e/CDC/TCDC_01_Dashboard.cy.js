/// <reference types="cypress" />
describe('CDC Page Validation - Tantor -> CDC_01', () => {
  let userData;

  before(() => {
    cy.fixture("CDC/Cdc_Dashboard.json").then((data) => {
      userData = data;
    });
  });

  beforeEach(() => {
    cy.loginAs(userData.Role);

    cy.xpath("//a[@href='/connections']").click();
    cy.get('select.w-44').should('be.visible').select(userData.Project);

    cy.xpath("//a[@href='/cdc']").should('be.visible').click();
    cy.url().should("include", "/cdc");
    cy.get('nav[aria-label="Breadcrumb"]', { timeout: 10000 }).should('contain.text', 'Platform').and('contain.text', 'CDC');

    cy.xpath("//h1[@class='text-2xl font-semibold']").should("be.visible");
    //cy.screenshot('CDC_Dashboard_Page');
  });

  it("Verify buttons visibility in cdc dashboard", () => {

    // CDC Header 
    cy.xpath("//h1[@class='text-2xl font-semibold']").should("be.visible");

    // 1. Kafka Dashboard button (first button)
    //cy.xpath("//h1[text() = 'Kafka Dashboard']").should("be.visible");

    // 2. List button (second button)
    cy.get('button:has(.lucide-list)').should("be.visible");

    // 3. Refresh button (third button)
    cy.get('button:has(svg.lucide-refresh-ccw)').should('be.visible');

    // 4. + Create CDC button (fourth button)
    cy.xpath("//button[text() = '+ Create CDC']").should("be.visible");

    // 5.
    cy.xpath("//h2[text() = 'CDC Overview']").should("be.visible");

    // 1. Check Creation box exists and has text 'Creation'
    cy.get('div.flex-1.min-w-64.bg-white')         // select all cards
      .contains('h2', 'Creation')                  // find the h2 with text 'Creation'
      .should('be.visible');

    // 2. Check Status box exists and has text 'Status'
    cy.get('div.flex-1.min-w-64.bg-white')
      .contains('h2', 'Status')
      .should('be.visible');

  });


  it("Verify List Menu Page functionlity", () => {
    cy.get('button:has(.lucide-list)').click();
    cy.log('Clicked List menu button');
    //cy.screenshot('After_clicking_List_men_ button');

    //-------- Table Headers --------------------------
    const headers = [
      "Name",
      "Project Name",
      "Created By",
      "Source Connection",
      "Target Connection",
      "Source Table",
      "Target Table",
      "Status",
      "Action"
    ];

    headers.forEach((header) => {
      cy.get("table thead")
        .contains(new RegExp(`^${header}$`, "i")) // 👈 case-insensitive regex
        .scrollIntoView().should("exist").should("be.visible");
    });

    //------------------------- Search field --------------------------------------
    const searchInput = cy.xpath("//input[@placeholder='Search...']");
    const searchVal = userData.Searchvalue;

    searchInput.type(searchVal);

    const charByChar = userData.CharByCharSearch; // Fallback
    searchInput.clear();
    for (let i = 0; i < charByChar.length; i++) {
      searchInput.type(charByChar.charAt(i));
    }

    //-------------------------------- Refresh CDC List View Page ----------------------------------
    cy.xpath("//div[@class = 'flex items-center space-x-4']//button").click();

    //--------------------------------------------- Column Sorting------------------------------------------------

    //Column Sorting - Verify Ascending order on 'any' column"
    cy.contains("thead div", userData.Table_Header).should("be.visible").click(); // Click header once for Ascending sort

    cy.get(`table tbody tr td:nth-child(${userData.Table_Header_Index})`) // 2nd column = Domain
      .then(($cells) => {
        const actual = [...$cells].map((cell) => cell.innerText.trim());
        // Print the captured array to the Cypress log and report
        cy.log('Captured Name Values (Ascending):', actual);
      });


    //Column Sorting - Verify Descending order on 'any' column"
    cy.contains("th div", userData.Table_Header).click(); // Click header again for Descending sort (2 clicks total)

    cy.get(`table tbody tr td:nth-child(${userData.Table_Header_Index})`) // 2nd column = Domain
      .then(($cells) => {
        const actual = [...$cells].map((cell) => cell.innerText.trim());
        // Print the captured array to the Cypress log and report
        cy.log('Captured Name Values (Descending):', actual);

      });


    // ----------------------- Pagination ------------------------
    //cy.verifyPagination("List View Page");
    });

});
