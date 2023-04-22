import { useCallback, useEffect, useState, useRef } from 'react';
import { Subject, useActualCallback } from 'react-declarative';

import Box, { BoxProps } from '@mui/material/Box';

import Wheel from '../../../components/common/Wheel';

import { makeStyles } from '../../../styles';

import { CC_DEG_PER_MSEC, CC_WHEEL_STEP, CC_WHEEL_VALUES } from '../../../config/params';

interface IWheelSpinnerProps extends BoxProps {
    beginAnimate: Subject<void>;
    beginStop: Subject<boolean>;
    onStop?: () => void;
}

const useStyles = makeStyles()({
    root: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    container: {
        position: 'relative',
    },
    dot: {
        position: 'absolute',
        top: '93px',
        left: 'calc(50% - 10px)',
        height: '20px',
        width: '20px',
        borderRadius: '10px',
        backgroundColor: 'whitesmoke',
        background: 'radial-gradient(circle, rgba(255,255,255,1) 0%, rgba(204,203,204,1) 100%)',
        zIndex: 1,
    }
});

let rotatePos = 0;
let stopStep: keyof typeof CC_WHEEL_VALUES | undefined = undefined;

const getRandomElement = <T extends any>(items: T[]): T => items[Math.floor(Math.random() * items.length)];

export const WheelSpinner = ({
    className,
    beginAnimate,
    beginStop,
    onStop = () => undefined,
}: IWheelSpinnerProps) => {

    const isMounted = useRef(true);

    useEffect(() => () => {
      isMounted.current = false
    }, []);


    const [rotate, setRotate] = useState(rotatePos);
    const { classes, cx } = useStyles();

    const onStop$ = useActualCallback(onStop);

    const handleAnimate = useCallback(() => {
        if (!isMounted.current) {
            return;
        }
        if (stopStep !== undefined) {
            const stopPos = (360 - Math.floor(CC_WHEEL_STEP * parseInt(stopStep))) % 360;
            if (rotatePos === stopPos) {
                onStop$();
                return
            }
        }
        rotatePos++;
        rotatePos = rotatePos % 360;
        setRotate(rotatePos);
        setTimeout(handleAnimate, CC_DEG_PER_MSEC);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [onStop$]);

    const handleStop = useCallback((isEven: boolean) => {
        const items = Object.entries(CC_WHEEL_VALUES)
            .filter(([_, value]) => {
                if (isEven) {
                    return value % 2 === 0;
                } else {
                    return value % 2 !== 0;
                }
            })
            .map(([idx]) => idx);
        stopStep = getRandomElement(items) as keyof typeof CC_WHEEL_VALUES;
        return {
            stopStep,
            stopValue: CC_WHEEL_VALUES[stopStep],
        };
    }, []);

    useEffect(() => {
        const animateUnsubscribe = beginAnimate.subscribe(() => {
            rotatePos = 0;
            stopStep = undefined;
            handleAnimate();
        });
        const stopUnsubscribe = beginStop.subscribe(handleStop);
        return () => {
            animateUnsubscribe();
            stopUnsubscribe();
        };
    }, [beginAnimate, beginStop, handleAnimate, handleStop]);

    return (
        <Box className={cx(className, classes.root)}>
            <Box className={classes.container}>
                <Wheel
                    style={{
                        transform: `rotate(${rotate}deg)`,
                    }}
                />
                <Box className={classes.dot} />
            </Box>
        </Box>
    );
};

export default WheelSpinner;
