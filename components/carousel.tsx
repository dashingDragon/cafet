import { Box, Stack, Typography, styled } from '@mui/material';
import { imageLoader } from '../pages/_app';
import Image from 'next/image';

export type CarouselItem = {
    label: string;
    icon: string;
}

const TabItem = styled(Box)(({ theme }) => ({
    width: '90px',
    borderRadius: '20px',
    padding: '8px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    background: theme.palette.background.paper,
    '&:hover, &.selected': {
        cursor: 'pointer',
        background: 'linear-gradient(125deg, rgba(247,184,94,1) 0%, rgba(222,69,69,1) 100%)',
    },
}));

const TabImage = styled(Box)(({ theme }) => ({
    borderRadius: '50%',
    width: '64px',
    height: '64px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: '8px',
    background: theme.palette.background.default,
}));

export const Carousel: React.FC<{
    carouselItems: CarouselItem[],
    tabIndex: number,
    setTabIndex: (n: number) => void;
}> = ({ carouselItems, tabIndex, setTabIndex}) => {
    return (
        <Stack sx={{
            width: '100%',
            height: '100px',
            flexShrink: 0,
            display: 'flex',
            flexDirection: 'row',
            overflowX: 'auto',
            my: '32px',
            gap: 2,
            borderRadius: '20px',
            scrollbarWidth: 'none',
            '&::-webkit-scrollbar': {
                display: 'none',
            },
            '&-ms-overflow-style:': {
                display: 'none',
            },
        }}>
            {carouselItems.map((item, i) => (
                <TabItem key={item.label} onClick={() => setTabIndex(i)} className={tabIndex === i ? 'selected' : ''}>
                    <TabImage>
                        <Image
                            loader={imageLoader}
                            src={item.icon}
                            alt={'Success image'}
                            width={48}
                            height={48}
                        />
                    </TabImage>
                    <Typography fontSize={10} sx={{
                        ...(tabIndex === i && ({
                            fontWeight: 700,
                        })),
                    }}>
                        {item.label}
                    </Typography>
                </TabItem>
            ))}
        </Stack>
    );
};