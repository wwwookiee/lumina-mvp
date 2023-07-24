# lumina-mvp

Demo : https://lumina-mvp.vercel.app

# Lumina Project

Lumina is a decentralized platform that aims to address the inequalities in the world of scientific publications. In a market dominated by major publishing houses, researchers face high publishing costs while reviewers often receive little to no compensation for their crucial work in reviewing research papers.

## Features

- Swap ETH for LUMI tokens based on the current ETH to USD rate.
- Stake LUMI and ETH to earn rewards (LUMI) based on an annual percentage rate (APR).
- Unstake LUMI and ETH to claim your earned rewards.
- Apply to become a contributor by providing your domain of expertise and references.
- Admins can assign contributors to specific research papers.
- Researchers can add their research projects with budgets in LUMI tokens.
- Contributors can validate or reject research papers.
- Users can read research papers by paying a reading fee in LUMI tokens.

## Getting Started

### Prerequisites

- You need [Node.js](https://nodejs.org/) and [yarn](https://classic.yarnpkg.com/lang/en/docs/install/) installed on your machine.

### Installation

1. Clone this repository:

```
git clone https://github.com/wwwookiee/lumina-mvp.git
cd backend 
```

2. Install the required dependencies:

```
cd backend  && yarn install
cd frontend && yarn install
```

### Usage

To use Lumina, follow these steps:

1. **Swap ETH for LUMI**: You can exchange ETH for LUMI tokens using the `swap()` function. Make sure to send some ETH along with the transaction.

2. **Stake LUMI and ETH**: Stake your LUMI and ETH to start earning rewards. Use the `stake()` function and provide the amount of LUMI you want to stake.

3. **Unstake and Claim Rewards**: When you want to stop staking, use the `unstake()` function to claim your rewards and unstake your LUMI and ETH.

4. **Contributor Application**: If you are interested in becoming a contributor, use the `contributorApplication()` function and provide your domain of expertise and references.

5. **Admin Assigning Contributors**: Admins can assign contributors to specific research papers using the `assignContributor()` function.

6. **Adding Research Projects**: Researchers can add their research projects using the `addResearch()` function. Note that you need to have at least 100 LUMI tokens to add a research project.

7. **Validating and Rejecting Research Papers**: Contributors can validate or reject research papers using the `validateResearch()` and `rejectResearch()` functions.

8. **Reading Research Papers**: Users can read research papers by paying a reading fee of 30 LUMI tokens using the `readingResearch()` function.

## Contributing

We welcome contributions to improve Lumina. Feel free to create issues, fork the repository, and submit pull requests.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Acknowledgments

We would like to thank the open-source community and all contributors who helped build Lumina into what it is today.